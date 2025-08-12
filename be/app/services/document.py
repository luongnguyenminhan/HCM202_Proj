"""
Document service for managing documents and chapters.
"""

import time
from typing import List, Optional
from sqlmodel import Session, select, func
from app.core.database import engine
from app.models import Document, Chapter, Chunk
from app.schemas.common_types import (
	DocumentListResponse,
	DocumentListItem,
	DocumentDetailResponse,
	ChapterSummary,
	HighlightResponse,
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

	async def save_highlight(
		self,
		document_id: int,
		chapter_id: Optional[int],
		text: str,
		start_position: Optional[int] = None,
		end_position: Optional[int] = None,
	) -> HighlightResponse:
		"""
		Save user highlight.
		TODO: Create highlights table and implement actual saving
		"""
		# Mock delay
		await asyncio.sleep(0.05)

		# Mock response - in real implementation:
		# 1. Validate document_id and chapter_id exist
		# 2. Create highlight record in database
		# 3. Return actual highlight_id

		mock_highlight_id = hash(f'{document_id}_{chapter_id}_{text}') % 10000

		return HighlightResponse(status='ok', highlight_id=mock_highlight_id)


import asyncio
