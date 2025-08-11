"""
Database initialization script for HCM Thoughts RAG project.
Creates database tables and sets up initial configuration.
"""

from app.core.database import create_db_and_tables
from app.models import Document, Chapter, Chunk, Quote, Post, Report


def init_db():
    """Initialize database with all tables"""
    print("Creating database tables...")

    try:
        # Import all models to ensure they are registered with SQLModel
        models = [Document, Chapter, Chunk, Quote, Post, Report]
        print(f"Registering {len(models)} models...")

        # Create all tables
        create_db_and_tables()

        print("✅ Database tables created successfully!")

        # Print table information
        print("\nCreated tables:")
        for model in models:
            table_name = getattr(model, "__tablename__", model.__name__.lower())
            print(f"  - {table_name}")

    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        raise


if __name__ == "__main__":
    init_db()
