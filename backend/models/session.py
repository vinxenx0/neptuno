# backend/models/session.py
# Módulo del modelo de sesión para usuarios anonimos que no estan identificados.
from sqlalchemy import Column, String, Integer, DateTime
from core.database import Base
from datetime import datetime

class AnonymousSession(Base):
    __tablename__ = "sesiones_anonimas"
    
    id = Column(String(36), primary_key=True, index=True)  # UUID como string
    credits = Column(Integer, default=100)  # Créditos disponibles
    create_at = Column(DateTime, default=datetime.utcnow)  # Fecha de creación
    ultima_actividad = Column(DateTime, nullable=True)  # Última interacción
    last_ip = Column(String(45), nullable=True)  # Última IP conocida