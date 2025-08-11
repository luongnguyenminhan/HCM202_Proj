"""
Article endpoints for blog posts and content.
Handles article listing, details, and categories.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from app.services import ArticleService
from app.schemas.common_types import (
    ArticleListResponse,
    ArticleDetailResponse,
    CategoriesResponse,
    FeaturedResponse,
    PaginationParams,
)

router = APIRouter(prefix="/articles", tags=["articles"])


def get_article_service() -> ArticleService:
    return ArticleService()


@router.get("/list", response_model=ArticleListResponse)
async def get_articles(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    article_service: ArticleService = Depends(get_article_service),
):
    """
    Get paginated list of articles.
    Supports pagination for homepage and article browser.
    """
    try:
        pagination = PaginationParams(page=page, limit=limit)
        response = await article_service.get_article_list(pagination)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get articles: {str(e)}")


@router.get("/{article_id}", response_model=ArticleDetailResponse)
async def get_article_detail(
    article_id: int, article_service: ArticleService = Depends(get_article_service)
):
    """
    Get article detail by ID.
    Shows full article content.
    """
    try:
        response = await article_service.get_article_detail(article_id)
        if not response:
            raise HTTPException(status_code=404, detail="Article not found")
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get article detail: {str(e)}"
        )


@router.get("/categories", response_model=CategoriesResponse)
async def get_categories(
    article_service: ArticleService = Depends(get_article_service),
):
    """
    Get article categories for filtering.
    TODO: Implement actual category system.
    """
    try:
        response = await article_service.get_categories()
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get categories: {str(e)}"
        )


@router.get("/featured", response_model=FeaturedResponse)
async def get_featured_articles(
    article_service: ArticleService = Depends(get_article_service),
):
    """
    Get featured articles for homepage.
    Returns articles marked as featured.
    """
    try:
        response = await article_service.get_featured_articles()
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get featured articles: {str(e)}"
        )
