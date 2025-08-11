from sqlmodel import SQLModel, create_engine, Session

from app.core.config import DATABASE_URL

# SQL Database setup with MySQL optimizations
engine = create_engine(
    DATABASE_URL,
    # MySQL-specific settings
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections every hour
    echo=False,  # Set to True for SQL debugging
    # For MySQL charset and collation
    connect_args={"charset": "utf8mb4", "collation": "utf8mb4_unicode_ci"},
)


def create_db_and_tables():
    """Create database tables from SQLModel models"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency to get database session for FastAPI"""
    with Session(engine) as session:
        try:
            yield session
        except Exception as e:
            session.rollback()
            print(f"[ERROR] Database session error: {e}")
            raise
        finally:
            session.close()


# Deprecated: Keep for backward compatibility
def get_db():
    """Deprecated: Use get_session() instead"""
    return get_session()
