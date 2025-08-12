"""
RAG service for handling chat queries.
Integrates with Qdrant for vector search and MySQL for metadata.
"""

import time
import asyncio
from typing import List, Tuple, Dict, Optional, AsyncIterator
from sqlmodel import Session, select
from app.core.database import engine
from app.models import Chunk
from app.schemas.common_types import (
    ChatResponse,
    ChatSource,
    ChatDebugInfo,
    ChatStreamEvent,
)
from app.core.config import RAG_TOP_K
from app.utils.embedding import get_embedding_provider
from app.services.vector import QdrantVectorService
from app.utils.llm import get_chat_model, build_prompt, stream_answer
from app.utils.color import (
    print_info,
    print_debug,
    print_success,
    print_warning,
    print_error,
)
from app.core.config import MEMORY_TTL_SECONDS, MEMORY_MAX_TURNS
from langgraph.graph import StateGraph, START, END


class RAGService:
    """Service for Retrieval-Augmented Generation"""

    def __init__(self):
        self.vector_search_timeout = 5.0
        self.llm_timeout = 10.0
        # Initialize embedding and vector services
        self.embedding_provider = get_embedding_provider()
        self.vector_service = QdrantVectorService()
        # Ensure collection exists
        try:
            self.vector_service.ensure_collection()
        except Exception:
            pass
        # Build LangGraph agent
        try:
            self._graph = self._build_agent_graph()
        except Exception:
            self._graph = None

    def _build_agent_graph(self):
        """Tạo LangGraph đơn giản: retrieve → context → generate."""
        print_debug('[_build_agent_graph] Initializing LangGraph agent...')
        graph = StateGraph(dict)

        async def node_retrieve(state: dict) -> dict:
            print_debug(f'[_build_agent_graph.node_retrieve] state={state}')
            question: str = state['question']
            retrieved = await self._search_vectors(question)
            print_debug(f'[_build_agent_graph.node_retrieve] retrieved={retrieved}')
            # Pass through all keys from state, add retrieved
            new_state = dict(state)
            new_state['retrieved'] = retrieved
            return new_state

        async def node_context(state: dict) -> dict:
            print_debug(f'[_build_agent_graph.node_context] state={state}')
            retrieved = state.get('retrieved') or []
            sources, context_text = await self._get_context_from_chunks(retrieved)
            print_debug(f'[_build_agent_graph.node_context] sources={sources}')
            print_debug(f'[_build_agent_graph.node_context] context_text={context_text[:200]}')
            # build citations
            citations_text = ''
            if sources:
                from sqlmodel import select
                from sqlalchemy.orm import selectinload
                from app.core.database import engine
                from app.models import Chapter

                with Session(engine) as session:
                    chapter_ids = [s.chapter_id for s in sources]
                    chapters = session.exec(select(Chapter).where(Chapter.id.in_(chapter_ids)).options(selectinload(Chapter.document))).all()
                    chap_map = {c.id: c for c in chapters}
                lines = []
                for s in sources[:5]:
                    chapter = chap_map.get(s.chapter_id)
                    doc_title = chapter.document.title if chapter else 'Tài liệu'
                    ch_title = chapter.title if chapter else 'Chương'
                    page = f' → trang {s.page_number}' if s.page_number else ''
                    lines.append(f'- [{doc_title}] → [{ch_title}]{page}: {s.text[:120]}…')
                citations_text = '\n'.join(lines)
                print_debug(f'[_build_agent_graph.node_context] citations_text={citations_text}')
            # Pass through all keys from state, add/overwrite sources, context_text, citations_text
            new_state = dict(state)
            new_state['sources'] = sources
            new_state['context_text'] = context_text
            new_state['citations_text'] = citations_text
            return new_state

        async def node_generate(state: dict) -> dict:
            print_debug(f'[_build_agent_graph.node_generate] state={state}')
            question: str = state['question']
            context_text: str = state.get('context_text', '')
            citations_text: str = state.get('citations_text', '')
            session_id: Optional[str] = state.get('session_id')
            memory_text = self._get_memory_context(session_id)
            print_debug(f'[_build_agent_graph.node_generate] memory_text={memory_text}')
            answer = await self._generate_answer(
                question,
                context_text,
                citations_text=citations_text,
                memory_text=memory_text,
            )
            print_success(f'[_build_agent_graph.node_generate] answer={answer}')
            # Pass through all keys from state, add/overwrite answer
            new_state = dict(state)
            new_state['answer'] = answer
            return new_state

        graph.add_node('retrieve', node_retrieve)
        graph.add_node('context', node_context)
        graph.add_node('generate', node_generate)
        graph.add_edge(START, 'retrieve')
        graph.add_edge('retrieve', 'context')
        graph.add_edge('context', 'generate')
        graph.add_edge('generate', END)
        print_debug('[_build_agent_graph] LangGraph agent compiled.')
        return graph.compile()

    async def query(
        self,
        question: str,
        include_debug: bool = False,
        session_id: Optional[str] = None,
    ) -> ChatResponse:
        """
        Main RAG query function.
        1. Search vectors in Qdrant
        2. Get metadata from MySQL
        3. Generate answer with LLM
        """
        start_time = time.time()

        print_info(f"[RAGService.query] question='{question[:80]}...' session_id={session_id}")
        print_debug(f'[RAGService.query] include_debug={include_debug}')

        # Run via LangGraph if available
        if self._graph is not None:
            state_in = {'question': question, 'session_id': session_id}
            print_debug(f'[RAGService.query] LangGraph state_in={state_in}')
            graph_start = time.time()
            state_out = await self._graph.ainvoke(state_in)
            print_debug(f'[RAGService.query] LangGraph state_out={state_out}')
            vector_time = graph_start  # unknown granular timing, fallback
            retrieved = state_out.get('retrieved', []) or []
            sources = state_out.get('sources', []) or []
            answer = state_out.get('answer', '')
            print_debug(f'[RAGService.query] LangGraph used, retrieved={len(retrieved)}, sources={len(sources)}')
        else:
            # Vector search
            print_debug(f'[RAGService.query] searching vector')
            retrieved = await self._search_vectors(question)
            print_debug(f'[RAGService.query] _search_vectors result={retrieved}')
            vector_time = time.time()
            print_debug(f'[RAGService.query] Vector search done, retrieved={len(retrieved)}')

            # If không tìm thấy nguồn phù hợp → trả fallback sớm
            if not retrieved:
                debug_info = None
                if include_debug:
                    debug_info = ChatDebugInfo(
                        retrieved_chunks=[],
                        query_time_ms=(time.time() - start_time) * 1000,
                        vector_search_time_ms=(vector_time - start_time) * 1000,
                    )
                return ChatResponse(
                    answer='Không tìm thấy trích dẫn phù hợp, vui lòng hỏi cụ thể hơn.',
                    sources=[],
                    num_citations=0,
                    debug=debug_info,
                )
            print_warning('[RAGService.query] No sources found, returning fallback answer.')

            # Get metadata and context
            sources, context_text = await self._get_context_from_chunks(retrieved)
            print_debug(f'[RAGService.query] _get_context_from_chunks sources={sources}')
            print_debug(f'[RAGService.query] _get_context_from_chunks context_text={context_text[:200]}')
            print_debug(f'[RAGService.query] Got {len(sources)} sources, context length={len(context_text)}')

            # Build citations text for prompt tailing
            citations_text = ''
            if sources:
                # Format: [doc_title] → [chapter] → [page?] + short quote
                print('Having Source')
                with Session(engine) as session:
                    from app.models import Chapter

                    chapter_ids = [s.chapter_id for s in sources]
                    chapters = session.exec(select(Chapter).where(Chapter.id.in_(chapter_ids))).all()
                    chap_map = {c.id: c for c in chapters}
                lines = []
                for s in sources[:5]:
                    chapter = chap_map.get(s.chapter_id)
                    doc_title = chapter.document.title if chapter else 'Tài liệu'
                    ch_title = chapter.title if chapter else 'Chương'
                    page = f' → trang {s.page_number}' if s.page_number else ''
                    lines.append(f'- [{doc_title}] → [{ch_title}]{page}: {s.text[:120]}…')
                citations_text = '\n'.join(lines)
            print_debug(f'[RAGService.query] citations_text={citations_text}')
            print_debug(f'[RAGService.query] Citations text built, length={len(citations_text)}')

            # Generate LLM answer via LangChain (with lightweight conversational memory)
            memory_text = self._get_memory_context(session_id)
            print_debug(f'[RAGService.query] memory_text={memory_text}')
            print_debug(f'[RAGService.query] Memory context length={len(memory_text)}')
            answer = await self._generate_answer(
                question,
                context_text,
                citations_text=citations_text,
                memory_text=memory_text,
            )
            print_success(f'[RAGService.query] LLM answer={answer}')
            print_success('[RAGService.query] LLM answer generated.')

        total_time = time.time()

        print_info(f'[RAGService.query] Total time: {(total_time - start_time):.2f}s')

        debug_info = None
        if include_debug:
            debug_info = ChatDebugInfo(
                retrieved_chunks=[cid for cid, _ in retrieved],
                query_time_ms=(total_time - start_time) * 1000,
                vector_search_time_ms=(vector_time - start_time) * 1000,
            )

        num_citations = min(len(sources), RAG_TOP_K)
        return ChatResponse(
            answer=answer,
            sources=sources,
            num_citations=num_citations,
            debug=debug_info,
        )

    async def stream_query(
        self,
        question: str,
        include_debug: bool = False,
        session_id: Optional[str] = None,
    ) -> AsyncIterator[ChatStreamEvent]:
        """Stream các sự kiện SSE cho phiên chat theo LangGraph pattern."""
        start_time = time.time()
        print_info(f"[RAGService.stream_query] question='{question[:80]}...' session_id={session_id}")
        print_debug(f'[RAGService.stream_query] include_debug={include_debug}')
        yield ChatStreamEvent(type='start', data={'message': 'started'})

        # Run via LangGraph if available
        if self._graph is not None:
            state_in = {'question': question, 'session_id': session_id}
            print_debug(f'[RAGService.stream_query] LangGraph state_in={state_in}')
            graph_start = time.time()
            state_out = await self._graph.ainvoke(state_in)
            print_debug(f'[RAGService.stream_query] LangGraph state_out={state_out}')
            vector_time = graph_start  # unknown granular timing, fallback
            retrieved = state_out.get('retrieved', []) or []
            sources = state_out.get('sources', []) or []
            answer = state_out.get('answer', '')
            citations_text = state_out.get('citations_text', '')
            print_debug(f'[RAGService.stream_query] LangGraph used, retrieved={len(retrieved)}, sources={len(sources)}')
            yield ChatStreamEvent(
                type='retrieval',
                data={
                    'retrieved_chunks': [cid for cid, _ in retrieved],
                    'count': len(retrieved),
                },
            )
            yield ChatStreamEvent(type='sources', data={'sources': [s.model_dump() for s in sources]})
            print_debug(f'[RAGService.stream_query] citations_text={citations_text}')
            print_debug(f'[RAGService.stream_query] Citations text built, length={len(citations_text)}')
            # Stream LLM tokens (simulate streaming)
            for token in answer.split():
                yield ChatStreamEvent(type='token', data={'text': token + ' '})
            print_success(f'[RAGService.stream_query] LLM streamed answer: {answer}')
            print_success('[RAGService.stream_query] LLM streaming finished.')
            total_time = time.time()
            print_info(f'[RAGService.stream_query] Total time: {(total_time - start_time):.2f}s')
            debug_info = None
            if include_debug:
                debug_info = ChatDebugInfo(
                    retrieved_chunks=[cid for cid, _ in retrieved],
                    query_time_ms=(total_time - start_time) * 1000,
                    vector_search_time_ms=(vector_time - start_time) * 1000,
                )
            num_citations = min(len(sources), RAG_TOP_K)
            response = ChatResponse(
                answer=answer,
                sources=sources,
                num_citations=num_citations,
                debug=debug_info,
            )
            try:
                self.append_memory(session_id, question, answer)
            except Exception:
                pass
            print_success('[RAGService.stream_query] Memory appended.')
            yield ChatStreamEvent(type='done', data={'response': response.model_dump()})
            return
        # ...existing code for non-LangGraph flow...

    async def _search_vectors(self, question: str) -> List[Tuple[int, float]]:
        """Search for similar vectors in Qdrant and return list of (chunk_id, score)."""
        # Embed question
        query_vec = self.embedding_provider.embed_text(question)
        # Search in Qdrant
        results = self.vector_service.search(query_vector=query_vec)
        return results

    async def _get_context_from_chunks(self, retrieved: List[Tuple[int, float]]) -> Tuple[List[ChatSource], str]:
        """Get metadata and context text from MySQL using retrieved chunk IDs and scores"""
        sources = []
        context_parts = []
        score_map: Dict[int, float] = {cid: score for cid, score in retrieved}

        with Session(engine) as session:
            # Query chunks with relationships
            chunk_ids = list(score_map.keys())
            if not chunk_ids:
                return [], ''
            statement = select(Chunk).where(Chunk.id.in_(chunk_ids))
            chunks = session.exec(statement).all()

            for chunk in chunks:
                # Get chapter and document info
                chapter = chunk.chapter
                document = chapter.document

                # Get quote if exists
                page_number = None
                text_snippet = chunk.chunk_text[:300] + '...' if len(chunk.chunk_text) > 300 else chunk.chunk_text
                if chunk.quotes:
                    page_number = chunk.quotes[0].page_number
                    # Prefer quote text if available for citation
                    if chunk.quotes[0].quote_text:
                        text_snippet = chunk.quotes[0].quote_text

                source = ChatSource(
                    document_id=document.id,
                    chapter_id=chapter.id,
                    chunk_id=chunk.id,
                    page_number=page_number,
                    text=text_snippet,
                    score=score_map.get(chunk.id),
                    url=None,
                )
                sources.append(source)
                context_parts.append(chunk.chunk_text)

        context_text = '\n\n'.join(context_parts)
        return sources, context_text

    async def _generate_answer(
        self,
        question: str,
        context: str,
        citations_text: str = '',
        memory_text: str = '',
    ) -> str:
        """Generate answer using LangChain chat model với persona + memory + citations"""
        print_info(f"[_generate_answer] Called with question='{question}'")
        print_debug(f'[_generate_answer] context (first 200 chars): {context[:200]}')
        print_debug(f'[_generate_answer] citations_text: {citations_text}')
        print_debug(f'[_generate_answer] memory_text: {memory_text}')
        try:
            chat = get_chat_model()
            print_info(f'[_generate_answer] get_chat_model() -> {chat}')
            prompt = build_prompt(
                question=question,
                context=context,
                citations_text=citations_text,
                memory_text=memory_text,
            )
            print_debug(f'[_generate_answer] prompt: {prompt}')
            chain = prompt | chat
            print_debug(f'[_generate_answer] chain: {chain}')
            result = await chain.ainvoke({})
            print_debug(f'[_generate_answer] chain.ainvoke result: {result}')
            content = getattr(result, 'content', str(result))
            print_success(f'[_generate_answer] content: {content}')
            return content or 'Không tìm thấy trích dẫn phù hợp, vui lòng hỏi cụ thể hơn.'
        except Exception as e:
            print_error(f'[_generate_answer] Exception: {e}')
            # Fallback: nếu LLM lỗi, trả câu trả lời ngắn
            return 'Xin lỗi, hiện không thể kết nối LLM. Vui lòng thử lại sau.'

    # ===== Lightweight in-memory conversation (per process) =====
    _session_memory: Dict[str, List[str]] = {}
    _session_timestamp: Dict[str, float] = {}

    def _get_memory_context(self, session_id: Optional[str]) -> str:
        if not session_id:
            return ''
        # cleanup TTL
        self._cleanup_memory()
        turns = self._session_memory.get(session_id, [])
        if not turns:
            return ''
        # limit to last MEMORY_MAX_TURNS*2 lines (Q/A pairs)
        last = turns[-(MEMORY_MAX_TURNS * 2) :]
        return '\n'.join(last)

    def append_memory(self, session_id: Optional[str], user_utterance: str, assistant_reply: str) -> None:
        if not session_id:
            return
        self._cleanup_memory()
        seq = self._session_memory.setdefault(session_id, [])
        seq.append(f'Người dùng: {user_utterance}')
        seq.append(f'Trợ lý: {assistant_reply}')
        import time as _t

        self._session_timestamp[session_id] = _t.time()

    def _cleanup_memory(self) -> None:
        import time as _t

        now = _t.time()
        expired: List[str] = []
        for sid, ts in list(self._session_timestamp.items()):
            if now - ts > MEMORY_TTL_SECONDS:
                expired.append(sid)
        for sid in expired:
            self._session_timestamp.pop(sid, None)
            self._session_memory.pop(sid, None)
