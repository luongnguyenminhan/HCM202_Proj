"""
Static content and utility endpoints.
Handles homepage content, health checks, and statistics.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.utils import get_system_stats
from app.schemas.common_types import (
    SpecialAnalysisResponse,
    FeaturedResponse,
    HealthResponse,
    StatsResponse,
)

router = APIRouter(tags=['static'])


@router.get('/special-analysis', response_model=SpecialAnalysisResponse)
async def get_special_analysis():
    """
    Get special analysis content.
    Static content for special topics page.
    """
    # Alias sang bài viết chuyên đề cố định (id do nghiệp vụ cấu hình). Tạm thời trả placeholder ngắn.
    return SpecialAnalysisResponse(
        title='Bài viết chuyên đề (alias)',
        content='Nội dung được lấy từ bài viết chuyên đề cố định. Vui lòng dùng /articles/{id} để lấy chi tiết.',
        cover_image='https://example.com/cover.jpg',
    )


@router.get('/homepage/featured', response_model=FeaturedResponse)
async def get_homepage_featured():
    """
    Get featured content for homepage.
    Redirects to articles/featured for consistency.
    """
    # TODO: This could be a different endpoint if homepage needs different featured content
    # For now, redirect to articles featured
    from app.services import ArticleService

    try:
        article_service = ArticleService()
        response = await article_service.get_featured_articles()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get featured content: {str(e)}')


@router.get('/health', response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns server status and timestamp.
    """
    return HealthResponse(status='ok', timestamp=datetime.now())


@router.get('/stats', response_model=StatsResponse)
async def get_statistics():
    """
    Get system statistics.
    Shows counts of documents, articles, chat queries etc.
    """
    try:
        response = await get_system_stats()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to get stats: {str(e)}')
