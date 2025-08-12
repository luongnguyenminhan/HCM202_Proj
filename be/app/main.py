"""
Main FastAPI application for HCM Thoughts RAG API.
Provides endpoints for chatbot, document management, and content.
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import database and API components
from app.core.database import create_db_and_tables
from app.api import api_router
from app.utils import print_info, print_success, print_error
from app.services import QdrantVectorService


@asynccontextmanager
async def lifespan(app: FastAPI):
	"""Application lifespan handler"""
	# Startup
	print_info('🚀 Starting HCM Thoughts RAG API...')

	# Create database tables
	try:
		create_db_and_tables()
		print_success('✅ Database tables created/verified')
	except Exception as e:
		print_error(f'❌ Database initialization failed: {e}')
		# Don't crash the app, continue without database

	# Ensure Qdrant collection
	try:
		QdrantVectorService().ensure_collection()
		print_success('✅ Qdrant collection ready')
	except Exception as e:
		print_error(f'⚠️ Qdrant not ready: {e}')

	yield

	# Shutdown
	print_info('🛑 Shutting down HCM Thoughts RAG API...')


# Create FastAPI app
app = FastAPI(
	title='HCM Thoughts RAG API',
	description='API for Hồ Chí Minh Thoughts Chatbot with RAG capabilities',
	version='1.0.0',
	docs_url='/docs',
	redoc_url='/redoc',
	lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
	CORSMiddleware,
	allow_origins=['*'],  # Configure for production
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)

# Include API routers
app.include_router(api_router)


@app.get('/')
async def root():
	"""Root endpoint with API information"""
	return {
		'message': 'Welcome to HCM Thoughts RAG API',
		'version': '1.0.0',
		'docs': '/docs',
		'status': 'running',
		'features': [
			'RAG Chatbot with Qdrant vector search',
			'Document management and browsing',
			'Article/blog system',
			'Admin corpus management',
			'Content reporting and moderation',
		],
	}


@app.get('/ping')
async def ping():
	"""Simple ping endpoint for health checks"""
	return {'message': 'pong'}


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
	return JSONResponse(
		status_code=404,
		content={
			'error': 'Not found',
			'detail': 'The requested resource was not found',
		},
	)


@app.exception_handler(500)
async def internal_error_handler(request, exc):
	return JSONResponse(
		status_code=500,
		content={
			'error': 'Internal server error',
			'detail': 'Something went wrong on our end',
		},
	)


@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
	"""No favicon provided"""
	return Response(status_code=204)


if __name__ == '__main__':
	import uvicorn

	uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True, log_level='info')
