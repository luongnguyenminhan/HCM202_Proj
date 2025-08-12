"""
Chat endpoints for RAG functionality.
Handles chat queries and reports.
"""

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from fastapi.responses import StreamingResponse
import json
from app.services import RAGService, ReportService
from app.schemas.common_types import (
    ChatQuery,
    ChatResponse,
    ChatReportRequest,
    ChatReportResponse,
)
from app.utils import print_info, print_error, print_success

router = APIRouter(prefix="/chat", tags=["chat"])


# Service dependencies
def get_rag_service() -> RAGService:
    return RAGService()


def get_report_service() -> ReportService:
    return ReportService()


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    query: ChatQuery,
    rag_service: RAGService = Depends(get_rag_service),
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
):
    """
    Process chat query using RAG.

    Steps:
    1. Search vectors in Qdrant
    2. Get metadata from MySQL
    3. Generate answer with LLM
    """
    try:
        print_info(
            f"/chat/query: question='{query.question[:80]}...' debug={query.include_debug}"
        )
        response = await rag_service.query(
            question=query.question,
            include_debug=query.include_debug,
            session_id=x_session_id,
        )
        # append lightweight memory
        try:
            rag_service.append_memory(x_session_id, query.question, response.answer)
        except Exception:
            pass
        print_success(f"/chat/query: answered with {len(response.sources)} sources")
        return response
    except HTTPException:
        raise
    except Exception as e:
        print_error(f"/chat/query failed: {e}")
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")


@router.get("/stream")
async def chat_stream(
    q: str = Query(..., min_length=1, max_length=1000, alias="q"),
    include_debug: bool = Query(False),
    rag_service: RAGService = Depends(get_rag_service),
    x_session_id: str | None = Header(default=None, alias="X-Session-Id"),
):
    """SSE stream trả lời chat theo LangGraph agent.

    Sử dụng EventSource (GET), query param `q`, header tuỳ chọn `X-Session-Id`.
    """

    async def event_generator():
        try:
            async for evt in rag_service.stream_query(
                q, include_debug=include_debug, session_id=x_session_id
            ):
                payload = {"type": evt.type, "data": evt.data}
                yield f"event: {evt.type}\n" + "data: " + json.dumps(
                    payload, ensure_ascii=False
                ) + "\n\n"
        except Exception as e:
            err = {"type": "error", "data": {"message": str(e)}}
            yield "event: error\n" + "data: " + json.dumps(
                err, ensure_ascii=False
            ) + "\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(
        event_generator(), media_type="text/event-stream", headers=headers
    )


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
        print_info(f"/chat/report: reference_id={report.reference_id}")
        response = await report_service.create_report(
            reference_id=report.reference_id, reason=report.reason, source=report.source
        )
        print_success(f"/chat/report: created id={response.report_id}")
        return response
    except Exception as e:
        print_error(f"/chat/report failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report creation failed: {str(e)}")
