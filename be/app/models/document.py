"""
Document and Chapter models for the HCM Thoughts RAG system.
Represents the hierarchical structure of documents and their chapters.
"""

from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .chunk import Chunk


class DocumentBase(SQLModel):
    """Base model for document data"""

    title: str = Field(max_length=255, index=True)
    description: Optional[str] = None
    file_path: Optional[str] = Field(default=None, max_length=500)
    source: Optional[str] = Field(default=None, max_length=255)


class Document(DocumentBase, table=True):
    """Document table model"""

    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    chapters: List["Chapter"] = Relationship(back_populates="document")


class ChapterBase(SQLModel):
    """Base model for chapter data"""

    title: str = Field(max_length=255, index=True)
    ordering: int = Field(default=0, index=True)
    summary: Optional[str] = None


class Chapter(ChapterBase, table=True):
    """Chapter table model"""

    __tablename__ = "chapters"

    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="documents.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    document: Document = Relationship(back_populates="chapters")
    chunks: List["Chunk"] = Relationship(back_populates="chapter")


# API Models
class DocumentCreate(DocumentBase):
    """Model for creating new documents"""

    pass


class DocumentUpdate(SQLModel):
    """Model for updating documents"""

    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    file_path: Optional[str] = Field(default=None, max_length=500)
    source: Optional[str] = Field(default=None, max_length=255)


class DocumentPublic(DocumentBase):
    """Public model for document responses"""

    id: int
    created_at: datetime


class ChapterCreate(ChapterBase):
    """Model for creating new chapters"""

    document_id: int


class ChapterUpdate(SQLModel):
    """Model for updating chapters"""

    title: Optional[str] = Field(default=None, max_length=255)
    ordering: Optional[int] = None
    summary: Optional[str] = None


class ChapterPublic(ChapterBase):
    """Public model for chapter responses"""

    id: int
    document_id: int
    created_at: datetime


# Response models with relationships
class DocumentWithChapters(DocumentPublic):
    """Document with its chapters included"""

    chapters: List[ChapterPublic] = []
