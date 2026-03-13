import os
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


default_sqlite_url = "sqlite:///./test.db"
database_url = os.getenv("DATABASE_URL", default_sqlite_url)

database_url = database_url.replace("cockroachdb://", "cockroachdb+psycopg://", 1)
print(f"Connecting to: {database_url}")



# For CockroachDB, skip version detection to avoid parsing errors


engine = create_engine(database_url)




SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
