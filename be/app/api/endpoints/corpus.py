"""
Admin corpus management endpoints.
Handles document upload, processing, and deletion.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from app.core.config import ADMIN_TOKEN
from app.services import CorpusService
from app.schemas.common_types import CorpusUploadResponse, CorpusDeleteResponse
from app.utils import print_info, print_warning, print_error

router = APIRouter(prefix='/corpus', tags=['corpus'])


def get_corpus_service() -> CorpusService:
	return CorpusService()


@router.post('/upload', response_model=CorpusUploadResponse)
async def upload_document(
	file: UploadFile = File(...),
	title: str = Form(...),
	description: str = Form(None),
	source: str = Form(None),
	x_admin_token: str | None = Header(default=None, alias='X-Admin-Token'),
	corpus_service: CorpusService = Depends(get_corpus_service),
):
	"""
	Upload and process document.

	Steps:
	1. Save file to storage
	2. Extract text content
	3. Detect chapters/sections
	4. Chunk text content
	5. Generate embeddings
	6. Save to Qdrant
	7. Save metadata to MySQL

	"""
	try:
		# Simple admin token check if configured
		if ADMIN_TOKEN and x_admin_token != ADMIN_TOKEN:
			print_warning('Unauthorized upload attempt: missing/invalid X-Admin-Token')
			raise HTTPException(status_code=401, detail='Unauthorized')
		# Validate file type
		allowed_types = [
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		]
		if file.content_type not in allowed_types:
			raise HTTPException(status_code=400, detail='Only PDF and DOCX files are supported')

		# Validate file size (10MB limit)
		max_size = 10 * 1024 * 1024  # 10MB
		if file.size and file.size > max_size:
			raise HTTPException(status_code=400, detail='File size too large (max 10MB)')

		print_info(f"/corpus/upload: title='{title}', source='{source}', content_type='{file.content_type}'")
		response = await corpus_service.upload_document(file=file.file, title=title, description=description, source=source)
		return response
	except HTTPException:
		raise
	except Exception as e:
		print_error(f'Upload failed: {e}')
		raise HTTPException(status_code=500, detail=f'Upload failed: {str(e)}')


@router.delete('/delete', response_model=CorpusDeleteResponse)
async def delete_document(
	document_id: int,
	x_admin_token: str | None = Header(default=None, alias='X-Admin-Token'),
	corpus_service: CorpusService = Depends(get_corpus_service),
):
	"""
	Delete document and all related data.

	Steps:
	1. Get all chunk qdrant_point_ids for this document
	2. Delete vectors from Qdrant
	3. Delete from MySQL (cascade deletes related records)

	"""
	try:
		if ADMIN_TOKEN and x_admin_token != ADMIN_TOKEN:
			print_warning('Unauthorized delete attempt: missing/invalid X-Admin-Token')
			raise HTTPException(status_code=401, detail='Unauthorized')
		response = await corpus_service.delete_document(document_id)
		return response
	except ValueError as e:
		raise HTTPException(status_code=404, detail=str(e))
	except Exception as e:
		print_error(f'Delete failed: {e}')
		raise HTTPException(status_code=500, detail=f'Delete failed: {str(e)}')
