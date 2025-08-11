"""
API endpoints initialization.
Collects all endpoint routers for main app.
"""

from fastapi import APIRouter
from .chat import router as chat_router
from .documents import router as docs_router
from .articles import router as articles_router
from .corpus import router as corpus_router
from .static import router as static_router

# Main API router
api_router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
api_router.include_router(chat_router)
api_router.include_router(docs_router)
api_router.include_router(articles_router)
api_router.include_router(corpus_router)
api_router.include_router(static_router)

# Export for main app
__all__ = ["api_router"]
