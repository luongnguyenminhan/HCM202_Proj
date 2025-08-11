"""
Document endpoints for document management.
Handles document listing, details, and highlights.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.services import DocumentService
from app.schemas.common_types import (
    DocumentListResponse,
    DocumentDetailResponse,
    HighlightRequest,
    HighlightResponse,
)

router = APIRouter(prefix="/docs", tags=["documents"])


def get_document_service() -> DocumentService:
    return DocumentService()


@router.get("/list", response_model=DocumentListResponse)
async def get_documents(doc_service: DocumentService = Depends(get_document_service)):
    """
    Get list of all documents with chapter counts.
    Used for document browser UI.
    """
    try:
        response = await doc_service.get_document_list()
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get documents: {str(e)}"
        )


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
async def get_document_detail(
    doc_id: int, doc_service: DocumentService = Depends(get_document_service)
):
    """
    Get document detail with chapters.
    Shows document structure and navigation.
    """
    try:
        response = await doc_service.get_document_detail(doc_id)
        if not response:
            raise HTTPException(status_code=404, detail="Document not found")
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get document detail: {str(e)}"
        )


@router.post("/highlight", response_model=HighlightResponse)
async def save_highlight(
    highlight: HighlightRequest,
    doc_service: DocumentService = Depends(get_document_service),
):
    """
    Save user highlight for later reference.
    TODO: Implement full highlight system with user accounts.
    """
    try:
        response = await doc_service.save_highlight(
            document_id=highlight.document_id,
            chapter_id=highlight.chapter_id,
            text=highlight.text,
            start_position=highlight.start_position,
            end_position=highlight.end_position,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to save highlight: {str(e)}"
        )
