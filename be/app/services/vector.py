"""
Qdrant vector service: ensure collection, upsert, and search.
"""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Tuple

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchAny,
    PointIdsList,
)

from app.core.config import (
    QDRANT_HOST,
    QDRANT_PORT,
    QDRANT_API_KEY,
    QDRANT_COLLECTION,
    QDRANT_DISTANCE,
    EMBEDDING_DIM,
    RAG_TOP_K,
)
import os
from app.utils.color import print_info, print_warning, print_error


# TODO: remove api_key
class QdrantVectorService:
    """Encapsulates Qdrant operations"""

    def __init__(self) -> None:
        # Ưu tiên: QDRANT_URL (đầy đủ http/https)
        qdrant_url = os.getenv("QDRANT_URL", "").strip()
        host_value = str(QDRANT_HOST or "").strip()
        try:
            if qdrant_url:
                self.client = QdrantClient(
                    url=qdrant_url,
                    api_key=QDRANT_API_KEY,
                )
            elif host_value.startswith("http://") or host_value.startswith("https://"):
                self.client = QdrantClient(
                    url=host_value,
                    api_key=QDRANT_API_KEY,
                )
            else:
                # Fallback: host/port (thường 6333 là HTTP)
                self.client = QdrantClient(
                    host=host_value or None,
                    port=QDRANT_PORT,
                    api_key=QDRANT_API_KEY,
                )
        except Exception as e:
            print_error(f"[Qdrant] Init client failed: {e}")
            raise

        # Chẩn đoán kết nối: in danh sách collections (không chặn luồng nếu lỗi)
        try:
            cols = self.client.get_collections()
            print_info(f"[Qdrant] get_collections: {cols}")
        except Exception as e:
            print_warning(f"[Qdrant] get_collections failed: {e}")
        self.collection = QDRANT_COLLECTION

    def ensure_collection(self) -> None:
        """Ensure the collection exists with correct vector params"""
        try:
            exists = self.client.collection_exists(self.collection)
        except Exception:
            exists = False

        if not exists:
            # Normalize distance name to Qdrant enum
            distance_name = (QDRANT_DISTANCE or "Cosine").upper()
            if distance_name not in {"COSINE", "DOT", "EUCLID"}:
                distance_name = "COSINE"
            distance = getattr(Distance, distance_name)
            self.client.recreate_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=EMBEDDING_DIM, distance=distance),
            )

    def upsert_points(
        self,
        ids: Iterable[int],
        vectors: Iterable[List[float]],
        payloads: Iterable[Dict[str, Any]],
    ) -> None:
        """Upsert points by id with vectors and payload"""
        points: List[PointStruct] = []
        for pid, vec, payload in zip(ids, vectors, payloads):
            points.append(PointStruct(id=int(pid), vector=vec, payload=payload))

        if not points:
            return

        self.client.upsert(collection_name=self.collection, points=points)

    def delete_points_by_ids(self, ids: List[int]) -> None:
        if not ids:
            return
        self.client.delete(
            collection_name=self.collection,
            points_selector=PointIdsList(points=[int(i) for i in ids]),
        )

    def search(
        self,
        query_vector: List[float],
        top_k: Optional[int] = None,
        document_ids: Optional[List[int]] = None,
        chapter_ids: Optional[List[int]] = None,
    ) -> List[Tuple[int, float]]:
        """Search nearest vectors. Optionally filter by document_ids.

        Returns list of (chunk_id, score)
        """
        top_k_final = top_k or RAG_TOP_K
        query_filter = None
        must_conditions: List[Any] = []
        if document_ids:
            must_conditions.append(
                FieldCondition(key="document_id", match=MatchAny(any=document_ids))
            )
        if chapter_ids:
            must_conditions.append(
                FieldCondition(key="chapter_id", match=MatchAny(any=chapter_ids))
            )
        if must_conditions:
            query_filter = Filter(must=must_conditions)

        results = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=top_k_final,
            query_filter=query_filter,
            with_payload=True,
            with_vectors=False,
        )

        out: List[Tuple[int, float]] = []
        for r in results:
            point_id = int(r.id)
            score = float(r.score)
            out.append((point_id, score))
        return out
