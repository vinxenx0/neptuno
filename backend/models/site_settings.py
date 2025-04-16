# backend/models/site_settings.py
# Modelo de configuración del sitio y sus claves

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from core.database import Base

class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    tag = Column(String(50), nullable=True) # Nuevo atributo
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Claves esperadas (documentación):
    # - token_expiration: int (segundos)
    # - refresh_token_expiration: int (segundos)
    # - rate_limit_auth: {"times": int, "seconds": int}
    # - rate_limit_api: {"times": int, "seconds": int}
    # - rate_limit_admin: {"times": int, "seconds": int}
    # - cache_ttl: int (segundos)
    # - cache_enabled: bool
    # - allowed_origins: bool indica si CORS está habilitado o no
    # Los valores de los orígenes permitidos se gestionan en la tabla AllowedOrigin
    # - celery_workers: int
    # - celery_task_timeout: int (segundos)
    # - db_pool_size: int
    # - db_max_overflow: int
    # - db_pool_timeout: int (segundos)
    # - freemium_credits: int
    # - premium_credits: int
    # - credit_reset_interval: int (días)
    # - log_level: str ("DEBUG", "INFO", "WARNING", "ERROR")