"""
Statistics utility functions.
Provides database statistics and metrics.
"""

import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select, func
from app.core.database import engine
from app.models import Document, Post, Chunk, Report
from app.schemas.common_types import StatsResponse


async def get_system_stats() -> StatsResponse:
    """Get system statistics"""
    await asyncio.sleep(0.1)

    with Session(engine) as session:
        # Count total documents
        doc_count_statement = select(func.count(Document.id))
        total_documents = session.exec(doc_count_statement).one()

        # Count total articles
        article_count_statement = select(func.count(Post.id))
        total_articles = session.exec(article_count_statement).one()

        # Count total chunks
        chunk_count_statement = select(func.count(Chunk.id))
        total_chunks = session.exec(chunk_count_statement).one()
        # Count total reports
        total_reports = session.exec(select(func.count(Report.id))).one()

    return StatsResponse(
        total_documents=total_documents,
        total_articles=total_articles,
        total_chunks=total_chunks,
        total_reports=total_reports,
    )
