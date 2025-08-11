"""
Post and Report models for the HCM Thoughts RAG system.
Posts for static content and Reports for content moderation.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PostBase(SQLModel):
    """Base model for post data"""

    title: str = Field(max_length=255, index=True)
    excerpt: Optional[str] = None
    content: str  # LONGTEXT in MySQL
    cover_image: Optional[str] = Field(default=None, max_length=500)
    is_featured: bool = Field(default=False, index=True)


class Post(PostBase, table=True):
    """Post table model"""

    __tablename__ = "posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now, index=True)
    updated_at: Optional[datetime] = None


class ReportBase(SQLModel):
    """Base model for report data"""

    source: str = Field(
        max_length=100, index=True
    )  # e.g., "chat_message", "article", "quote"
    reference_id: str = Field(max_length=128, index=True)  # message_id or related id
    reason: Optional[str] = None
    resolved: bool = Field(default=False)


class Report(ReportBase, table=True):
    """Report table model"""

    __tablename__ = "reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    reported_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None


# API Models
class PostCreate(PostBase):
    """Model for creating new posts"""

    pass


class PostUpdate(SQLModel):
    """Model for updating posts"""

    title: Optional[str] = Field(default=None, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = Field(default=None, max_length=500)
    is_featured: Optional[bool] = None


class PostPublic(PostBase):
    """Public model for post responses"""

    id: int
    created_at: datetime
    updated_at: Optional[datetime]


class ReportCreate(ReportBase):
    """Model for creating new reports"""

    pass


class ReportUpdate(SQLModel):
    """Model for updating reports"""

    reason: Optional[str] = None
    resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None


class ReportPublic(ReportBase):
    """Public model for report responses"""

    id: int
    reported_at: datetime
    resolved_at: Optional[datetime]
