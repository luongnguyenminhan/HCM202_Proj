"""
Document endpoints for document management.
Handles document listing, details, and highlights.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from app.services import DocumentService
from app.schemas.common_types import ChunkSearchResponse, ChapterChunksResponse
from app.schemas.common_types import (
    DocumentListResponse,
    DocumentDetailResponse,
)

router = APIRouter(prefix='/docs', tags=['documents'])


def get_document_service() -> DocumentService:
    return DocumentService()


@router.get('/list', response_model=DocumentListResponse)
async def get_documents(doc_service: DocumentService = Depends(get_document_service)):
    """
    Get list of all documents with chapter counts.
    Used for document browser UI.
    """
    try:
        response = await doc_service.get_document_list()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get documents: {str(e)}')


@router.get('/{doc_id}', response_model=DocumentDetailResponse)
async def get_document_detail(doc_id: int, doc_service: DocumentService = Depends(get_document_service)):
    """
    Get document detail with chapters.
    Shows document structure and navigation.
    """
    try:
        response = await doc_service.get_document_detail(doc_id)
        if not response:
            raise HTTPException(status_code=404, detail='Document not found')
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get document detail: {str(e)}')


@router.get('/search', response_model=ChunkSearchResponse)
async def search_chunks(
    q: str = Query(..., min_length=1),
    doc_id: int | None = Query(default=None),
    chapter_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    doc_service: DocumentService = Depends(get_document_service),
):
    """Semantic search snippets theo yêu cầu MVP, trả về snippet, score, doc/chapter/page, chunk_id + offsets."""
    try:
        return await doc_service.semantic_search(q=q, doc_id=doc_id, chapter_id=chapter_id, page=page, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to search: {str(e)}')


@router.get('/chunks', response_model=ChapterChunksResponse)
async def get_chunks(
    chapter_id: int = Query(..., description='Chapter Id'),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, description='Optional highlight query to compute offsets'),
    doc_service: DocumentService = Depends(get_document_service),
):
    """Lấy danh sách chunks theo `chapter_id` có pagination. Nếu có `q` trả về highlights offsets per chunk."""
    try:
        return await doc_service.get_chunks_by_chapter(chapter_id=chapter_id, page=page, limit=limit, q=q)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to fetch chunks: {str(e)}')
