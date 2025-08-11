"""
Admin corpus management endpoints.
Handles document upload, processing, and deletion.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.services import CorpusService
from app.schemas.common_types import CorpusUploadResponse, CorpusDeleteResponse

router = APIRouter(prefix="/corpus", tags=["corpus"])


def get_corpus_service() -> CorpusService:
    return CorpusService()


@router.post("/upload", response_model=CorpusUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(None),
    source: str = Form(None),
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

    TODO: Add file type validation, virus scanning, size limits
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, detail="Only PDF and DOCX files are supported"
            )

        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if file.size and file.size > max_size:
            raise HTTPException(
                status_code=400, detail="File size too large (max 10MB)"
            )

        response = await corpus_service.upload_document(
            file=file.file, title=title, description=description, source=source
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/delete", response_model=CorpusDeleteResponse)
async def delete_document(
    document_id: int, corpus_service: CorpusService = Depends(get_corpus_service)
):
    """
    Delete document and all related data.

    Steps:
    1. Get all chunk qdrant_point_ids for this document
    2. Delete vectors from Qdrant
    3. Delete from MySQL (cascade deletes related records)

    TODO: Add admin authentication
    """
    try:
        response = await corpus_service.delete_document(document_id)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
