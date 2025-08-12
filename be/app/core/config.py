import os
from dotenv import load_dotenv

# Load environment from .env if present
load_dotenv()


DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '11minhan')
DB_HOST = os.getenv('DB_HOST', 'host.docker.internal')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'hcm_thoughts')
DATABASE_URL = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

# Qdrant configuration
QDRANT_HOST = os.getenv('QDRANT_HOST', 'localhost')
QDRANT_PORT = int(os.getenv('QDRANT_PORT', '6333'))
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
# Collection được chuẩn hóa theo plan → 'hcm_chunks'
QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION', 'hcm_chunks')
QDRANT_DISTANCE = os.getenv('QDRANT_DISTANCE', 'Cosine')  # Cosine | Dot | Euclid

# Embedding configuration
EMBEDDING_PROVIDER = os.getenv('EMBEDDING_PROVIDER', 'google')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
EMBEDDING_MODEL_ID = os.getenv('EMBEDDING_MODEL_ID', 'text-embedding-004')
EMBEDDING_DIM = int(os.getenv('EMBEDDING_DIM', '768'))

# RAG defaults
RAG_TOP_K = int(os.getenv('RAG_TOP_K', '5'))
# Giới hạn tối đa theo quyết định nghiệp vụ
RAG_MAX_TOP_K = int(os.getenv('RAG_MAX_TOP_K', '10'))

# LLM config
LLM_MODEL_ID = os.getenv('LLM_MODEL_ID', 'gemini-2.5-flash')

# Session memory (LangGraph-like) cấu hình
MEMORY_TTL_SECONDS = int(os.getenv('MEMORY_TTL_SECONDS', '3600'))  # 1 giờ
MEMORY_MAX_TURNS = int(os.getenv('MEMORY_MAX_TURNS', '10'))

# Storage
STORAGE_DIR = os.getenv('STORAGE_DIR', 'storage/documents')

# Admin
ADMIN_TOKEN = os.getenv('ADMIN_TOKEN', '11minhan')
