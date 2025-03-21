from sqlalchemy import Column, Integer, String, Boolean, DateTime
from models.user import Base
from datetime import datetime

class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)  # Ejemplo: "max_credits_freemium", "site_maintenance"
    value = Column(String(255), nullable=False)  # Valor como string (puede convertirse según contexto)
    description = Column(String(255), nullable=True)  # Descripción del ajuste
    updated_by = Column(Integer, nullable=True)  # ID del admin que lo modificó
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Última actualización