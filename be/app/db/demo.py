"""
Example usage of the HCM Thoughts RAG models.
Demonstrates CRUD operations and relationships.
"""

from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.models import (
	Document,
	DocumentCreate,
	Chapter,
	ChapterCreate,
	Chunk,
	ChunkCreate,
	Quote,
	QuoteCreate,
)


def create_sample_data():
	"""Create sample data to demonstrate the models"""

	with Session(engine) as session:
		# Create a document
		document_data = DocumentCreate(
			title='Tư tưởng Hồ Chí Minh về xây dựng con người',
			description='Tài liệu về tư tưởng Hồ Chí Minh trong việc xây dựng con người mới',
			source='Nhà xuất bản Chính trị Quốc gia',
		)
		document = Document.model_validate(document_data.model_dump())
		session.add(document)
		session.commit()
		session.refresh(document)

		print(f'📄 Created document: {document.title} (ID: {document.id})')

		# Create chapters
		chapters_data = [
			ChapterCreate(
				document_id=document.id,
				title='Chương 1: Tư tưởng giáo dục con người',
				ordering=1,
				summary='Quan điểm của Hồ Chí Minh về giáo dục và phát triển con người',
			),
			ChapterCreate(
				document_id=document.id,
				title='Chương 2: Đạo đức cách mạng',
				ordering=2,
				summary='Tư tưởng về đạo đức và phẩm chất của người cách mạng',
			),
		]

		chapters = []
		for chapter_data in chapters_data:
			chapter = Chapter.model_validate(chapter_data.model_dump())
			session.add(chapter)
			chapters.append(chapter)

		session.commit()
		for chapter in chapters:
			session.refresh(chapter)
			print(f'📖 Created chapter: {chapter.title} (ID: {chapter.id})')

		# Create chunks for first chapter
		chunks_data = [
			ChunkCreate(
				chapter_id=chapters[0].id,
				chunk_index=0,
				qdrant_point_id='doc1_ch1_chunk0',
				chunk_text='Hồ Chí Minh luôn coi trọng việc giáo dục con người. Người cho rằng giáo dục là nền tảng của sự phát triển xã hội.',
			),
			ChunkCreate(
				chapter_id=chapters[0].id,
				chunk_index=1,
				qdrant_point_id='doc1_ch1_chunk1',
				chunk_text='Theo quan điểm của Bác Hồ, con người cần được phát triển toàn diện cả về trí tuệ, đạo đức và thể chất.',
			),
		]

		chunks = []
		for chunk_data in chunks_data:
			chunk = Chunk.model_validate(chunk_data.model_dump())
			session.add(chunk)
			chunks.append(chunk)

		session.commit()
		for chunk in chunks:
			session.refresh(chunk)
			print(f'📝 Created chunk: ID {chunk.id}, Index {chunk.chunk_index}')

		# Create quotes
		quote_data = QuoteCreate(
			chunk_id=chunks[0].id,
			quote_text='Giáo dục là nền tảng của sự phát triển xã hội',
			excerpt_start=50,
			excerpt_end=100,
		)

		quote = Quote.model_validate(quote_data.model_dump())
		session.add(quote)
		session.commit()
		session.refresh(quote)

		print(f'💬 Created quote: {quote.quote_text[:50]}...')

		return document.id


def query_with_relationships(document_id: int):
	"""Demonstrate querying with relationships"""

	with Session(engine) as session:
		# Query document with chapters
		statement = select(Document).where(Document.id == document_id)
		document = session.exec(statement).first()

		if document:
			print(f'\n📚 Document: {document.title}')
			print(f'   Created: {document.created_at}')
			print(f'   Chapters: {len(document.chapters)}')

			for chapter in document.chapters:
				print(f'   📖 Chapter {chapter.ordering}: {chapter.title}')
				print(f'      Chunks: {len(chapter.chunks)}')

				for chunk in chapter.chunks:
					print(f'      📝 Chunk {chunk.chunk_index}: {chunk.chunk_text[:50]}...')
					if chunk.quotes:
						for quote in chunk.quotes:
							print(f'         💬 Quote: {quote.quote_text}')


def main():
	"""Main demonstration function"""
	print('🚀 HCM Thoughts RAG Models Demo')
	print('=' * 50)

	# Create sample data
	document_id = create_sample_data()

	# Query with relationships
	query_with_relationships(document_id)

	print('\n✅ Demo completed successfully!')


if __name__ == '__main__':
	main()
