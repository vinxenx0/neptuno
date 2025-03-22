# backend/models/site_settings.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from core.database import Base

class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)  # Ejemplo: "max_credits_freemium", "site_maintenance"
    value = Column(String(255), nullable=False)  # Valor como string (puede convertirse según contexto)
    description = Column(String(255), nullable=True)  # Descripción del ajuste
    updated_by = Column(Integer, nullable=True)  # ID del admin que lo modificó
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Última actualización
    
     # Claves esperadas (documentación):
    # - token_expiration: int (segundos)
    # - refresh_token_expiration: int (segundos)
    # - rate_limit_auth: {"times": int, "seconds": int}
    # - rate_limit_api: {"times": int, "seconds": int}
    # - rate_limit_admin: {"times": int, "seconds": int}
    # - cache_ttl: int (segundos)
    # - cache_enabled: bool
    # - allowed_origins: list[str]
    # - celery_workers: int
    # - celery_task_timeout: int (segundos)
    # - db_pool_size: int
    # - db_max_overflow: int
    # - db_pool_timeout: int (segundos)
    # - freemium_credits: int
    # - premium_credits: int
    # - credit_reset_interval: int (días)
    # - log_level: str ("DEBUG", "INFO", "WARNING", "ERROR")