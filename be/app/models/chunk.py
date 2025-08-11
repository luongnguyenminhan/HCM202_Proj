"""
Chunk and Quote models for the HCM Thoughts RAG system.
Represents text chunks with their vector embeddings and extracted quotes.
"""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .document import Chapter, ChapterPublic, DocumentPublic


class ChunkBase(SQLModel):
    """Base model for chunk data"""

    chunk_index: int = Field(index=True)
    qdrant_point_id: Optional[str] = Field(default=None, max_length=128, index=True)
    chunk_text: str = Field(index=False)  # LONGTEXT in MySQL


class Chunk(ChunkBase, table=True):
    """Chunk table model"""

    __tablename__ = "chunks"

    id: Optional[int] = Field(default=None, primary_key=True)
    chapter_id: int = Field(foreign_key="chapters.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    chapter: "Chapter" = Relationship(back_populates="chunks")
    quotes: List["Quote"] = Relationship(back_populates="chunk")


class QuoteBase(SQLModel):
    """Base model for quote data"""

    quote_text: str
    excerpt_start: Optional[int] = None
    excerpt_end: Optional[int] = None
    page_number: Optional[int] = None


class Quote(QuoteBase, table=True):
    """Quote table model"""

    __tablename__ = "quotes"

    id: Optional[int] = Field(default=None, primary_key=True)
    chunk_id: int = Field(foreign_key="chunks.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    chunk: Chunk = Relationship(back_populates="quotes")


# API Models
class ChunkCreate(ChunkBase):
    """Model for creating new chunks"""

    chapter_id: int


class ChunkUpdate(SQLModel):
    """Model for updating chunks"""

    chunk_index: Optional[int] = None
    qdrant_point_id: Optional[str] = Field(default=None, max_length=128)
    chunk_text: Optional[str] = None


class ChunkPublic(ChunkBase):
    """Public model for chunk responses"""

    id: int
    chapter_id: int
    created_at: datetime


class QuoteCreate(QuoteBase):
    """Model for creating new quotes"""

    chunk_id: int


class QuoteUpdate(SQLModel):
    """Model for updating quotes"""

    quote_text: Optional[str] = None
    excerpt_start: Optional[int] = None
    excerpt_end: Optional[int] = None
    page_number: Optional[int] = None


class QuotePublic(QuoteBase):
    """Public model for quote responses"""

    id: int
    chunk_id: int
    created_at: datetime


# Response models with relationships
class ChunkWithQuotes(ChunkPublic):
    """Chunk with its quotes included"""

    quotes: List[QuotePublic] = []


# Models for RAG responses with full context
class ChunkWithContext(ChunkPublic):
    """Chunk with chapter and document context for RAG responses"""

    chapter: "ChapterPublic"
    document: "DocumentPublic"


class QuoteWithContext(QuotePublic):
    """Quote with full context chain for citations"""

    chunk: ChunkWithContext
