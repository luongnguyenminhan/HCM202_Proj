"""
Document service for managing documents and chapters.
"""

import time
from typing import List, Optional, Tuple
from sqlmodel import Session, select, func
from app.core.database import engine
from app.models import Document, Chapter, Chunk, Quote
from app.schemas.common_types import (
    DocumentListResponse,
    DocumentListItem,
    DocumentDetailResponse,
    ChapterSummary,
    PaginationResponse,
    ChunkSearchResponse,
    ChunkSnippet,
    HighlightOffset,
    ChapterChunksResponse,
    ChunkListItem,
)


class DocumentService:
    """Service for document operations"""

    async def get_document_list(self) -> DocumentListResponse:
        """Get list of all documents with chapter counts"""
        # Mock delay
        await asyncio.sleep(0.1)

        with Session(engine) as session:
            # Get documents with chapter counts
            statement = select(Document, func.count(Chapter.id).label('chapter_count')).outerjoin(Chapter).group_by(Document.id)

            results = session.exec(statement).all()

            documents = []
            for doc, chapter_count in results:
                documents.append(
                    DocumentListItem(
                        id=doc.id,
                        title=doc.title,
                        summary=doc.description,  # Using description as summary
                        cover_image=None,  # TODO: Add cover_image field to Document model
                        chapter_count=chapter_count or 0,
                    )
                )

            return DocumentListResponse(documents=documents)

    async def get_document_detail(self, doc_id: int) -> Optional[DocumentDetailResponse]:
        """Get document detail with chapters"""
        # Mock delay
        await asyncio.sleep(0.1)

        with Session(engine) as session:
            # Get document
            statement = select(Document).where(Document.id == doc_id)
            document = session.exec(statement).first()

            if not document:
                return None

            # Get chapters ordered by ordering field
            chapter_statement = select(Chapter).where(Chapter.document_id == doc_id).order_by(Chapter.ordering)
            chapters = session.exec(chapter_statement).all()

            chapter_summaries = [
                ChapterSummary(
                    id=chapter.id,
                    title=chapter.title,
                    summary=chapter.summary,
                    ordering=chapter.ordering,
                )
                for chapter in chapters
            ]

            return DocumentDetailResponse(
                id=document.id,
                title=document.title,
                summary=document.description,
                cover_image=None,  # TODO: Add cover_image field
                chapters=chapter_summaries,
            )

    async def semantic_search(
        self,
        q: str,
        doc_id: Optional[int],
        chapter_id: Optional[int],
        page: int,
        limit: int,
    ) -> ChunkSearchResponse:
        """Semantic search dựa trên Qdrant; trả offsets để FE highlight."""
        await asyncio.sleep(0.05)
        from app.services.vector import QdrantVectorService
        from app.utils.embedding import get_embedding_provider

        embedding = get_embedding_provider().embed_text(q)
        vector = QdrantVectorService()
        vector.ensure_collection()

        # Cho phép filter theo doc/chapter ở payload Qdrant
        filter_ids = None
        # Nếu filter chapter → cần map ra list chunk thuộc chapter này
        with Session(engine) as session:
            if chapter_id:
                st = select(Chunk.id).where(Chunk.chapter_id == chapter_id)
                chunk_ids = [cid for (cid,) in session.exec(st).all()]
                # Nếu không có, trả rỗng
                if not chunk_ids:
                    return ChunkSearchResponse(
                        items=[],
                        pagination=PaginationResponse(page=page, limit=limit, total=0),
                    )
            else:
                chunk_ids = None

        # Gọi search, Qdrant không filter theo list chunk-id sẵn có trừ khi dùng payload filter.
        # Ở upload đã set payload document_id/chapter_id → dùng filter theo doc/chapter nếu cung cấp.
        results = vector.search(
            query_vector=embedding,
            top_k=limit,
            document_ids=[doc_id] if doc_id else None,
            chapter_ids=[chapter_id] if chapter_id else None,
        )

        with Session(engine) as session:
            ids = [cid for cid, _ in results]
            if not ids:
                return ChunkSearchResponse(
                    items=[],
                    pagination=PaginationResponse(page=page, limit=limit, total=0),
                )

            chunks = session.exec(select(Chunk).where(Chunk.id.in_(ids))).all()
            # Map id→chunk
            id_to_chunk = {c.id: c for c in chunks}

            items: List[ChunkSnippet] = []
            for cid, score in results:
                ch = id_to_chunk.get(cid)
                if not ch:
                    continue
                # Lấy page_number nếu có Quote
                page_number = None
                if ch.quotes:
                    page_number = ch.quotes[0].page_number
                text = ch.chunk_text
                # Tính offsets đơn giản: tìm tất cả match của q (case-insensitive)
                offsets: List[HighlightOffset] = []
                q_lower = q.lower()
                txt_lower = text.lower()
                start = 0
                while True:
                    idx = txt_lower.find(q_lower, start)
                    if idx == -1:
                        break
                    offsets.append(HighlightOffset(start=idx, end=idx + len(q)))
                    start = idx + len(q)
                    if len(offsets) >= 5:
                        break

                snippet_text = text[:300] + '...' if len(text) > 300 else text
                items.append(
                    ChunkSnippet(
                        chunk_id=ch.id,
                        document_id=ch.chapter.document_id,
                        chapter_id=ch.chapter_id,
                        page_number=page_number,
                        score=float(score),
                        snippet=snippet_text,
                        offsets=offsets,
                    )
                )

            return ChunkSearchResponse(
                items=items,
                pagination=PaginationResponse(
                    page=page,
                    limit=limit,
                    total=len(items),
                    has_next=False,
                    has_prev=(page > 1),
                ),
            )

    async def get_chunks_by_chapter(self, chapter_id: int, page: int, limit: int, q: Optional[str] = None) -> ChapterChunksResponse:
        """Lấy danh sách chunks theo chapter có phân trang, kèm highlights nếu có q."""
        await asyncio.sleep(0.05)
        with Session(engine) as session:
            # Verify chapter exists
            chapter = session.exec(select(Chapter).where(Chapter.id == chapter_id)).first()
            if not chapter:
                from fastapi import HTTPException

                raise HTTPException(status_code=404, detail='Chapter not found')

            # pagination naive theo id tăng dần
            base_q = select(Chunk).where(Chunk.chapter_id == chapter_id).order_by(Chunk.chunk_index)
            # count
            count_q = select(func.count(Chunk.id)).where(Chunk.chapter_id == chapter_id)
            total = session.exec(count_q).one()
            offset = (page - 1) * limit
            items_db = session.exec(base_q.offset(offset).limit(limit)).all()

            items: List[ChunkListItem] = []
            for ch in items_db:
                # Highlight offsets nếu có q
                highlights: List[HighlightOffset] = []
                if q:
                    q_lower = q.lower()
                    txt_lower = ch.chunk_text.lower()
                    start = 0
                    while True:
                        idx = txt_lower.find(q_lower, start)
                        if idx == -1:
                            break
                        highlights.append(HighlightOffset(start=idx, end=idx + len(q)))
                        start = idx + len(q)
                        if len(highlights) >= 5:
                            break

                # page_number từ quote đầu nếu có, nếu không để None như yêu cầu
                page_number = None
                if ch.quotes:
                    page_number = ch.quotes[0].page_number

                items.append(
                    ChunkListItem(
                        chunk_id=ch.id,
                        chunk_index=ch.chunk_index,
                        page_number=page_number,
                        text=ch.chunk_text,
                        highlights=highlights,
                    )
                )

            has_next = offset + len(items_db) < total
            has_prev = page > 1
            return ChapterChunksResponse(
                chapter_id=chapter_id,
                items=items,
                pagination=PaginationResponse(
                    page=page,
                    limit=limit,
                    total=total,
                    has_next=has_next,
                    has_prev=has_prev,
                ),
            )


import asyncio
