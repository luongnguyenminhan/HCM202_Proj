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
	Quote,
	DocumentCreate,
	ChapterCreate,
	ChunkCreate,
)
from app.schemas.common_types import CorpusUploadResponse, CorpusDeleteResponse
from app.utils.embedding import get_embedding_provider
from app.services.vector import QdrantVectorService
from app.utils import (
	print_info,
	print_success,
	print_error,
	print_warning,
	print_debug,
)
from app.utils.chunking import (
	extract_text_from_pdf,
	extract_text_from_docx,
	naive_split_chapters,
	chunk_by_chars,
)


class CorpusService:
	"""Service for managing document corpus"""

	async def upload_document(self, file: BinaryIO, title: str, description: str = None, source: str = None) -> CorpusUploadResponse:
		"""
		Upload and process document.
		"""
		print_info(f"Upload start: title='{title}', source='{source}'")

		# 1. Save file to storage
		# 2. Extract text content (PDF, DOCX, etc.)
		# 3. Detect chapters/sections
		# 4. Chunk text content
		# 5. Generate embeddings
		# 6. Save to Qdrant
		# 7. Save metadata to MySQL

		# Read bytes and identify type by simple header (endpoint already validates content_type)
		file_content = file.read()
		file_hash = hashlib.md5(file_content).hexdigest()
		print_debug(f'File size={len(file_content)} bytes, md5={file_hash}')
		text_content = ''
		try:
			if file_content[:4] == b'%PDF':
				text_content = extract_text_from_pdf(file_content)
			else:
				# attempt DOCX
				text_content = extract_text_from_docx(file_content)
		except Exception as e:
			print_warning(f'Failed to parse file bytes smartly, fallback as raw text: {e}')
			try:
				text_content = file_content.decode('utf-8', errors='ignore')
			except Exception:
				text_content = ''

		with Session(engine) as session:
			# Create document
			document_data = DocumentCreate(
				title=title,
				description=description,
				file_path=f'/storage/docs/{file_hash}.pdf',
				source=source,
			)
			document = Document.model_validate(document_data.model_dump())
			session.add(document)
			session.commit()
			session.refresh(document)
			print_success(f'Document created id={document.id}')

			# Detect chapters (naive) from text_content
			chapters = []
			detected = naive_split_chapters(text_content)
			for idx, (title_c, content_c) in enumerate(detected, start=1):
				chapter_data = ChapterCreate(
					document_id=document.id,
					title=title_c[:255] or f'Chương {idx}',
					ordering=idx,
					summary=((content_c[:200] + '...') if len(content_c) > 200 else content_c),
				)
				chapter = Chapter.model_validate(chapter_data.model_dump())
				session.add(chapter)
				chapters.append((chapter, content_c))

			session.commit()
			for chapter, _ in chapters:
				session.refresh(chapter)
			print_success(f'Chapters created: {len(chapters)}')

			# Mock chunks
			print_info('Chunking text…')
			total_chunks = 0
			for chapter, content_c in chapters:
				chunks = chunk_by_chars(content_c, max_chars=3000, overlap=500)
				for j, chunk_text in enumerate(chunks):
					chunk_data = ChunkCreate(
						chapter_id=chapter.id,
						chunk_index=j,
						qdrant_point_id=None,
						chunk_text=chunk_text,
					)
					chunk = Chunk.model_validate(chunk_data.model_dump())
					session.add(chunk)
					total_chunks += 1

			session.commit()
			print_success(f'Chunks created: {total_chunks}')

			# Fetch created chunks for this document
			statement = select(Chunk).join(Chapter).where(Chapter.document_id == document.id).order_by(Chunk.id)
			created_chunks = session.exec(statement).all()

			# Generate embeddings and upsert to Qdrant
			print_info('Generating embeddings…')
			embedding_provider = get_embedding_provider()
			vector_service = QdrantVectorService()
			vector_service.ensure_collection()

			texts = [c.chunk_text for c in created_chunks]
			vectors = embedding_provider.embed_texts(texts)
			print_success(f'Embeddings generated: {len(vectors)}')

			ids = [int(c.id) for c in created_chunks]
			payloads = []
			doc_id_value = int(document.id)
			for c in created_chunks:
				payloads.append({
					# All chunks belong to the same document in this upload flow
					'document_id': doc_id_value,
					'chapter_id': c.chapter_id,
					'chunk_id': c.id,
					'chunk_index': c.chunk_index,
					'created_at': c.created_at.isoformat(),
				})

			print_info('Upserting vectors to Qdrant…')
			vector_service.upsert_points(ids=ids, vectors=vectors, payloads=payloads)
			print_success('Qdrant upsert completed')

			# Update qdrant_point_id for each chunk to map to its id
			print_info('Syncing qdrant_point_id to DB…')
			for c in created_chunks:
				c.qdrant_point_id = str(c.id)
				session.add(c)

			session.commit()
			print_success(f'Upload flow finished: doc_id={document.id}, chunks={total_chunks}')

		# Prepare return values explicitly to avoid detached instance access
		return CorpusUploadResponse(
			status='ok',
			document_id=doc_id_value,
			chapter_count=len(chapters),
			chunk_count=total_chunks,
		)

	async def delete_document(self, document_id: int) -> CorpusDeleteResponse:
		"""
		Delete document and all related data.
		"""
		print_info(f'Delete start: document_id={document_id}')

		with Session(engine) as session:
			# Get document to verify it exists
			statement = select(Document).where(Document.id == document_id)
			document = session.exec(statement).first()

			if not document:
				raise ValueError(f'Document {document_id} not found')
			print_info(f'Found document id={document_id}, proceeding to delete')

			# Delete vectors from Qdrant (best-effort)
			try:
				vector_service = QdrantVectorService()
				# Collect all chunk ids for this document
				statement_chunks = select(Chunk.id).join(Chapter).where(Chapter.document_id == document_id)
				chunk_ids = [cid for (cid,) in session.exec(statement_chunks).all()]
				if chunk_ids:
					print_info(f'Deleting {len(chunk_ids)} vectors from Qdrant…')
					vector_service.delete_points_by_ids(chunk_ids)
					print_success('Qdrant vector deletion completed')
				else:
					print_warning('No chunk ids found for this document in DB')
			except Exception:
				# Ignore vector deletion failures for now
				print_error('Failed to delete vectors from Qdrant (ignored)')

			# Manual cascade delete in DB to avoid NULLing FKs
			print_info('Deleting Quotes…')
			quotes = session.exec(select(Quote).join(Chunk).join(Chapter).where(Chapter.document_id == document_id)).all()
			for q in quotes:
				session.delete(q)
			session.commit()
			print_success(f'Deleted {len(quotes)} quotes')

			print_info('Deleting Chunks…')
			chunks = session.exec(select(Chunk).join(Chapter).where(Chapter.document_id == document_id)).all()
			for ch in chunks:
				session.delete(ch)
			session.commit()
			print_success(f'Deleted {len(chunks)} chunks')

			print_info('Deleting Chapters…')
			chapters = session.exec(select(Chapter).where(Chapter.document_id == document_id)).all()
			for cp in chapters:
				session.delete(cp)
			session.commit()
			print_success(f'Deleted {len(chapters)} chapters')

			print_info('Deleting Document…')
			session.delete(document)
			session.commit()
			print_success(f'Deleted document {document_id}')
			print_success(f'Deleted document {document_id} and related records')

		return CorpusDeleteResponse(status='ok', deleted_document_id=document_id)
