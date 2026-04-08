import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres123@db:5432/corpvuln"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency injection — dùng trong FastAPI endpoint."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_raw_connection():
    """Trả về raw psycopg2 connection — dùng cho các endpoint cần nối chuỗi SQL thủ công (intentionally vulnerable)."""
    return engine.raw_connection()