"""
Database models for HCM Thoughts Chatbot RAG project.
Using SQLModel for FastAPI integration and type safety.
"""

# Import all models to make them available
from .document import (
    Document,
    Chapter,
    DocumentBase,
    ChapterBase,
    DocumentCreate,
    DocumentUpdate,
    DocumentPublic,
    ChapterCreate,
    ChapterUpdate,
    ChapterPublic,
    DocumentWithChapters,
)

from .chunk import (
    Chunk,
    Quote,
    ChunkBase,
    QuoteBase,
    ChunkCreate,
    ChunkUpdate,
    ChunkPublic,
    QuoteCreate,
    QuoteUpdate,
    QuotePublic,
    ChunkWithQuotes,
    ChunkWithContext,
    QuoteWithContext,
)

from .content import (
    Post,
    Report,
    PostBase,
    ReportBase,
    PostCreate,
    PostUpdate,
    PostPublic,
    ReportCreate,
    ReportUpdate,
    ReportPublic,
)

# Export all models for easy import
__all__ = [
    # Table models
    "Document",
    "Chapter",
    "Chunk",
    "Quote",
    "Post",
    "Report",
    # Base models
    "DocumentBase",
    "ChapterBase",
    "ChunkBase",
    "QuoteBase",
    "PostBase",
    "ReportBase",
    # Create models
    "DocumentCreate",
    "ChapterCreate",
    "ChunkCreate",
    "QuoteCreate",
    "PostCreate",
    "ReportCreate",
    # Update models
    "DocumentUpdate",
    "ChapterUpdate",
    "ChunkUpdate",
    "QuoteUpdate",
    "PostUpdate",
    "ReportUpdate",
    # Public models
    "DocumentPublic",
    "ChapterPublic",
    "ChunkPublic",
    "QuotePublic",
    "PostPublic",
    "ReportPublic",
    # Relationship models
    "DocumentWithChapters",
    "ChunkWithQuotes",
    "ChunkWithContext",
    "QuoteWithContext",
]
