from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use SQLite for MVP, switch to Postgres later
# Use SQLite for MVP, switch to Postgres later
import sys
# Calculate absolute path to nexus_os/apps/nexus.db
# __file__ is nexus_os/core/database.py
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
# Hardcode absolute path to ensure consistency across all sub-processes
ROOT_DIR = os.path.abspath(os.path.join(CORE_DIR, "../../"))
DB_PATH = os.path.join(ROOT_DIR, "nexus_os/apps/nexus.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
