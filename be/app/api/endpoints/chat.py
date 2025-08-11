"""
Chat endpoints for RAG functionality.
Handles chat queries and reports.
"""

from fastapi import APIRouter, HTTPException, Depends
from app.services import RAGService, ReportService
from app.schemas.common_types import (
    ChatQuery,
    ChatResponse,
    ChatReportRequest,
    ChatReportResponse,
    ErrorResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


# Service dependencies
def get_rag_service() -> RAGService:
    return RAGService()


def get_report_service() -> ReportService:
    return ReportService()


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    query: ChatQuery, rag_service: RAGService = Depends(get_rag_service)
):
    """
    Process chat query using RAG.

    Steps:
    1. Search vectors in Qdrant
    2. Get metadata from MySQL
    3. Generate answer with LLM
    """
    try:
        response = await rag_service.query(
            question=query.question, include_debug=query.include_debug
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")


@router.post("/report", response_model=ChatReportResponse)
async def report_chat_response(
    report: ChatReportRequest,
    report_service: ReportService = Depends(get_report_service),
):
    """
    Report incorrect or inappropriate chat response.
    Saves report for admin review.
    """
    try:
        response = await report_service.create_report(
            reference_id=report.reference_id, reason=report.reason, source=report.source
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report creation failed: {str(e)}")
