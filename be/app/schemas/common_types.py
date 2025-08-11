"""
Common types and schemas for HCM Thoughts RAG API.
Defines shared response models and utility types.
"""

from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


# Common response wrapper
class ApiResponse(BaseModel):
    """Base API response wrapper"""

    status: str = "ok"
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response schema"""

    status: str = "error"
    message: str
    details: Optional[Dict[str, Any]] = None


# Pagination
class PaginationParams(BaseModel):
    """Pagination parameters"""

    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)


class PaginationResponse(BaseModel):
    """Pagination response info"""

    page: int
    limit: int
    total: int
    has_next: bool = False
    has_prev: bool = False


# RAG specific types
class ChatSource(BaseModel):
    """Source information for RAG responses"""

    document_id: int
    document_title: str
    chapter_id: int
    chapter_title: str
    quote: str


class ChatDebugInfo(BaseModel):
    """Debug information for RAG responses"""

    retrieved_chunks: List[int]
    query_time_ms: Optional[float] = None
    vector_search_time_ms: Optional[float] = None


class ChatResponse(BaseModel):
    """Chat query response"""

    answer: str
    sources: List[ChatSource]
    debug: Optional[ChatDebugInfo] = None


class ChatQuery(BaseModel):
    """Chat query request"""

    question: str = Field(..., min_length=1, max_length=1000)
    include_debug: bool = False


class ChatReportRequest(BaseModel):
    """Chat report request"""

    message_id: Optional[str] = None
    reference_id: str
    reason: str = Field(..., min_length=1, max_length=500)
    source: str = Field(default="chat_message")


class ChatReportResponse(ApiResponse):
    """Chat report response"""

    report_id: int


# Document types
class DocumentListItem(BaseModel):
    """Document list item"""

    id: int
    title: str
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    chapter_count: int


class DocumentListResponse(BaseModel):
    """Document list response"""

    documents: List[DocumentListItem]


class ChapterSummary(BaseModel):
    """Chapter summary for document detail"""

    id: int
    title: str
    summary: Optional[str] = None
    ordering: int


class DocumentDetailResponse(BaseModel):
    """Document detail response"""

    id: int
    title: str
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    chapters: List[ChapterSummary]


class HighlightRequest(BaseModel):
    """Highlight save request"""

    document_id: int
    chapter_id: Optional[int] = None
    text: str = Field(..., min_length=1)
    start_position: Optional[int] = None
    end_position: Optional[int] = None


class HighlightResponse(ApiResponse):
    """Highlight save response"""

    highlight_id: int


# Article types
class ArticleListItem(BaseModel):
    """Article list item"""

    id: int
    title: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    created_at: datetime


class ArticleListResponse(BaseModel):
    """Article list response with pagination"""

    articles: List[ArticleListItem]
    pagination: PaginationResponse


class ArticleDetailResponse(BaseModel):
    """Article detail response"""

    id: int
    title: str
    content: str
    cover_image: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CategoryItem(BaseModel):
    """Category item"""

    id: int
    name: str


class CategoriesResponse(BaseModel):
    """Categories response"""

    categories: List[CategoryItem]


# Admin corpus management
class CorpusUploadResponse(ApiResponse):
    """Corpus upload response"""

    document_id: int
    chapter_count: int
    chunk_count: int


class CorpusDeleteResponse(ApiResponse):
    """Corpus delete response"""

    deleted_document_id: int


# Static content
class SpecialAnalysisResponse(BaseModel):
    """Special analysis content response"""

    title: str
    content: str
    cover_image: Optional[str] = None


class FeaturedItem(BaseModel):
    """Featured article item"""

    id: int
    title: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None


class FeaturedResponse(BaseModel):
    """Featured articles response"""

    featured: List[FeaturedItem]


# Health and stats
class HealthResponse(BaseModel):
    """Health check response"""

    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.now)


class StatsResponse(BaseModel):
    """Statistics response"""

    chat_queries_today: int
    total_documents: int
    total_articles: int
    total_chunks: Optional[int] = None
    last_updated: datetime = Field(default_factory=datetime.now)
