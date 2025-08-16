"""
Embedding utilities.
Supports Google Generative AI embeddings (text-embedding-004).
"""

from __future__ import annotations

from typing import List, Optional
import google.generativeai as genai
import os

from app.core.config import GOOGLE_API_KEY, EMBEDDING_MODEL_ID, EMBEDDING_PROVIDER
from app.utils.color import print_error, print_debug


class GoogleEmbeddingProvider:
    """Google Generative AI embedding provider"""

    def __init__(self, api_key: Optional[str] = None, model_id: Optional[str] = None):
        api_key_to_use = api_key or GOOGLE_API_KEY
        if not api_key_to_use:
            raise ValueError("GOOGLE_API_KEY is not set")
        # Cho phép vô hiệu hoá verify SSL khi DEV_DISABLE_SSL_VERIFY=true (DEV only)
        if os.getenv("DEV_DISABLE_SSL_VERIFY", "false").lower() in {"1", "true", "yes"}:
            os.environ.setdefault("CURL_CA_BUNDLE", "")
            os.environ.setdefault("REQUESTS_CA_BUNDLE", "")
            os.environ.setdefault("PYTHONHTTPSVERIFY", "0")
            print_debug(
                "[Embedding] DEV_DISABLE_SSL_VERIFY enabled for Google GenAI client"
            )
        try:
            genai.configure(api_key=api_key_to_use)
        except Exception as e:
            print_error(f"[Embedding] genai.configure failed: {e}")
            # vẫn tiếp tục, lỗi sẽ được bắt ở bước gọi API
        self.model_id = model_id or EMBEDDING_MODEL_ID

    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string."""
        try:
            result = genai.embed_content(model=self.model_id, content=text)
        except Exception as e:
            print_error(f"[Embedding] embed_content failed: {e}")
            raise
        # google-generativeai may return dict or object with 'embedding'
        embedding = getattr(result, "embedding", None)
        if embedding is None and isinstance(result, dict):
            embedding = result.get("embedding")
        if embedding is None:
            raise RuntimeError("Failed to obtain embedding from Google API response")
        return list(embedding)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts (simple loop)."""
        return [self.embed_text(t) for t in texts]


def get_embedding_provider():
    """Factory to get the configured embedding provider."""
    provider_name = (EMBEDDING_PROVIDER or "google").lower()
    if provider_name == "google":
        return GoogleEmbeddingProvider()
    raise ValueError(f"Unsupported EMBEDDING_PROVIDER: {EMBEDDING_PROVIDER}")
