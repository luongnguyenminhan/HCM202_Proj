"""
Admin service for corpus management.
Handles document upload, processing, and deletion.
"""

import asyncio
import hashlib
from typing import BinaryIO
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.models import (
    Document,
    Chapter,
    Chunk,
    DocumentCreate,
    ChapterCreate,
    ChunkCreate,
)
from app.schemas.common_types import CorpusUploadResponse, CorpusDeleteResponse


class CorpusService:
    """Service for managing document corpus"""

    async def upload_document(
        self, file: BinaryIO, title: str, description: str = None, source: str = None
    ) -> CorpusUploadResponse:
        """
        Upload and process document.
        TODO: Implement file processing, chunking, and vector generation
        """
        await asyncio.sleep(2.0)  # Mock processing time

        # TODO: Implement actual file processing
        # 1. Save file to storage
        # 2. Extract text content (PDF, DOCX, etc.)
        # 3. Detect chapters/sections
        # 4. Chunk text content
        # 5. Generate embeddings
        # 6. Save to Qdrant
        # 7. Save metadata to MySQL

        # Mock implementation
        file_content = file.read()
        file_hash = hashlib.md5(file_content).hexdigest()

        with Session(engine) as session:
            # Create document
            document_data = DocumentCreate(
                title=title,
                description=description,
                file_path=f"/storage/docs/{file_hash}.pdf",
                source=source,
            )
            document = Document.model_validate(document_data.model_dump())
            session.add(document)
            session.commit()
            session.refresh(document)

            # Mock chapters
            chapters = []
            for i in range(1, 4):  # 3 mock chapters
                chapter_data = ChapterCreate(
                    document_id=document.id,
                    title=f"Chương {i}: Mock Chapter",
                    ordering=i,
                    summary=f"Tóm tắt chương {i}",
                )
                chapter = Chapter.model_validate(chapter_data.model_dump())
                session.add(chapter)
                chapters.append(chapter)

            session.commit()
            for chapter in chapters:
                session.refresh(chapter)

            # Mock chunks
            total_chunks = 0
            for chapter in chapters:
                for j in range(5):  # 5 chunks per chapter
                    chunk_data = ChunkCreate(
                        chapter_id=chapter.id,
                        chunk_index=j,
                        qdrant_point_id=f"doc_{document.id}_ch_{chapter.id}_chunk_{j}",
                        chunk_text=f"Mock chunk content for chapter {chapter.ordering}, chunk {j}",
                    )
                    chunk = Chunk.model_validate(chunk_data.model_dump())
                    session.add(chunk)
                    total_chunks += 1

            session.commit()

        return CorpusUploadResponse(
            status="ok",
            document_id=document.id,
            chapter_count=len(chapters),
            chunk_count=total_chunks,
        )

    async def delete_document(self, document_id: int) -> CorpusDeleteResponse:
        """
        Delete document and all related data.
        TODO: Implement Qdrant vector deletion
        """
        await asyncio.sleep(0.5)

        with Session(engine) as session:
            # Get document to verify it exists
            statement = select(Document).where(Document.id == document_id)
            document = session.exec(statement).first()

            if not document:
                raise ValueError(f"Document {document_id} not found")

            # TODO: Delete vectors from Qdrant
            # 1. Get all chunk qdrant_point_ids for this document
            # 2. Call Qdrant API to delete these points
            # 3. Handle Qdrant deletion errors

            # Delete from MySQL (cascade will handle related records)
            session.delete(document)
            session.commit()

        return CorpusDeleteResponse(status="ok", deleted_document_id=document_id)
