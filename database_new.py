"""
Sovereign OS — Database Engine (SQLModel)
Clean SQLModel engine + session dependency. All data persisted to SQLite.
"""
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sovereign.db")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},  # Required for SQLite
)


def create_db_and_tables():
    """Create all SQLModel tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency: yields a database session and ensures cleanup."""
    with Session(engine) as session:
        yield session
