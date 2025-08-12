"""
RAG service for handling chat queries.
Integrates with Qdrant for vector search and MySQL for metadata.
"""

import time
from typing import List, Tuple, Dict
from sqlmodel import Session, select
from app.core.database import engine
from app.models import Chunk
from app.schemas.common_types import ChatResponse, ChatSource, ChatDebugInfo
from app.core.config import RAG_TOP_K
from app.utils.embedding import get_embedding_provider
from app.services.vector import QdrantVectorService
from app.utils.llm import get_chat_model, build_prompt


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

    async def query(self, question: str, include_debug: bool = False) -> ChatResponse:
        """
        Main RAG query function.
        1. Search vectors in Qdrant
        2. Get metadata from MySQL
        3. Generate answer with LLM
        """
        start_time = time.time()

        # Vector search
        retrieved = await self._search_vectors(question)
        vector_time = time.time()

        # Get metadata and context
        sources, context_text = await self._get_context_from_chunks(retrieved)

        # Generate LLM answer via LangChain
        answer = await self._generate_answer(question, context_text)

        total_time = time.time()

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

    async def _search_vectors(self, question: str) -> List[Tuple[int, float]]:
        """Search for similar vectors in Qdrant and return list of (chunk_id, score)."""
        # Embed question
        query_vec = self.embedding_provider.embed_text(question)
        # Search in Qdrant
        results = self.vector_service.search(query_vector=query_vec)
        return results

    async def _get_context_from_chunks(
        self, retrieved: List[Tuple[int, float]]
    ) -> Tuple[List[ChatSource], str]:
        """Get metadata and context text from MySQL using retrieved chunk IDs and scores"""
        sources = []
        context_parts = []
        score_map: Dict[int, float] = {cid: score for cid, score in retrieved}

        with Session(engine) as session:
            # Query chunks with relationships
            chunk_ids = list(score_map.keys())
            if not chunk_ids:
                return [], ""
            statement = select(Chunk).where(Chunk.id.in_(chunk_ids))
            chunks = session.exec(statement).all()

            for chunk in chunks:
                # Get chapter and document info
                chapter = chunk.chapter
                document = chapter.document

                # Get quote if exists
                page_number = None
                text_snippet = (
                    chunk.chunk_text[:300] + "..."
                    if len(chunk.chunk_text) > 300
                    else chunk.chunk_text
                )
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

        context_text = "\n\n".join(context_parts)
        return sources, context_text

    async def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LangChain chat model with contextual prompt"""
        try:
            chat = get_chat_model()
            prompt = build_prompt(question=question, context=context)
            chain = prompt | chat
            result = await chain.ainvoke({})
            return getattr(result, "content", str(result))
        except Exception:
            # Fallback: nếu LLM lỗi, trả câu trả lời ngắn
            return "Xin lỗi, hiện không thể kết nối LLM. Vui lòng thử lại sau."
