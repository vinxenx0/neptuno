# backend/core/database.py
# Módulo de conexión a la base de datos.
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

#pool_size = get_setting(db, "db_pool_size") or 20
#max_overflow = get_setting(db, "db_max_overflow") or 10
#pool_timeout = get_setting(db, "db_pool_timeout") or 30

engine = create_engine(
    settings.DATABASE_URL,
    #pool_size=pool_size,
    #max_overflow=max_overflow,
    #pool_timeout=pool_timeout,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if settings.ENVIRONMENT == "development" else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()