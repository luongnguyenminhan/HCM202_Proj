"""
Article service for managing blog posts and content.
"""

import asyncio
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select, func, desc
from app.core.database import engine
from app.models import Post
from app.schemas.common_types import (
    ArticleListResponse,
    ArticleListItem,
    ArticleDetailResponse,
    CategoriesResponse,
    CategoryItem,
    PaginationParams,
    PaginationResponse,
    FeaturedResponse,
    FeaturedItem,
)


class ArticleService:
    """Service for article/post operations"""

    async def get_article_list(
        self, pagination: PaginationParams
    ) -> ArticleListResponse:
        """Get paginated list of articles"""
        await asyncio.sleep(0.1)

        with Session(engine) as session:
            # Get total count
            count_statement = select(func.count(Post.id))
            total = session.exec(count_statement).one()

            # Get paginated articles
            offset = (pagination.page - 1) * pagination.limit
            statement = (
                select(Post)
                .order_by(desc(Post.created_at))
                .offset(offset)
                .limit(pagination.limit)
            )

            posts = session.exec(statement).all()

            articles = [
                ArticleListItem(
                    id=post.id,
                    title=post.title,
                    excerpt=post.excerpt,
                    cover_image=post.cover_image,
                    created_at=post.created_at,
                )
                for post in posts
            ]

            pagination_response = PaginationResponse(
                page=pagination.page,
                limit=pagination.limit,
                total=total,
                has_next=offset + pagination.limit < total,
                has_prev=pagination.page > 1,
            )

            return ArticleListResponse(
                articles=articles, pagination=pagination_response
            )

    async def get_article_detail(
        self, article_id: int
    ) -> Optional[ArticleDetailResponse]:
        """Get article detail by ID"""
        await asyncio.sleep(0.05)

        with Session(engine) as session:
            statement = select(Post).where(Post.id == article_id)
            post = session.exec(statement).first()

            if not post:
                return None

            return ArticleDetailResponse(
                id=post.id,
                title=post.title,
                content=post.content,
                cover_image=post.cover_image,
                created_at=post.created_at,
                updated_at=post.updated_at,
            )

    async def get_categories(self) -> CategoriesResponse:
        """
        Get article categories.
        TODO: Add category field to Post model or create separate Category table
        """
        await asyncio.sleep(0.02)

        # Mock categories - in real implementation, get from database
        categories = [
            CategoryItem(id=1, name="Tư tưởng chính trị"),
            CategoryItem(id=2, name="Đạo đức cách mạng"),
            CategoryItem(id=3, name="Giáo dục"),
            CategoryItem(id=4, name="Văn hóa"),
            CategoryItem(id=5, name="Phân tích chuyên sâu"),
        ]

        return CategoriesResponse(categories=categories)

    async def get_featured_articles(self) -> FeaturedResponse:
        """Get featured articles"""
        await asyncio.sleep(0.05)

        with Session(engine) as session:
            statement = (
                select(Post)
                .where(Post.is_featured == True)
                .order_by(desc(Post.created_at))
                .limit(5)  # Top 5 featured
            )

            posts = session.exec(statement).all()

            featured = [
                FeaturedItem(
                    id=post.id,
                    title=post.title,
                    excerpt=post.excerpt,
                    cover_image=post.cover_image,
                )
                for post in posts
            ]

            return FeaturedResponse(featured=featured)
