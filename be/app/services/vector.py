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


class QdrantVectorService:
	"""Encapsulates Qdrant operations"""

	def __init__(self) -> None:
		self.client = QdrantClient(
			host=QDRANT_HOST,
			port=QDRANT_PORT,
			api_key=QDRANT_API_KEY,
			prefer_grpc=False,
		)
		self.collection = QDRANT_COLLECTION

	def ensure_collection(self) -> None:
		"""Ensure the collection exists with correct vector params"""
		try:
			exists = self.client.collection_exists(self.collection)
		except Exception:
			exists = False

		if not exists:
			# Normalize distance name to Qdrant enum
			distance_name = (QDRANT_DISTANCE or 'Cosine').upper()
			if distance_name not in {'COSINE', 'DOT', 'EUCLID'}:
				distance_name = 'COSINE'
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
	) -> List[Tuple[int, float]]:
		"""Search nearest vectors. Optionally filter by document_ids.

		Returns list of (chunk_id, score)
		"""
		top_k_final = top_k or RAG_TOP_K
		query_filter = None
		if document_ids:
			query_filter = Filter(must=[FieldCondition(key='document_id', match=MatchAny(any=document_ids))])

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
