# backend/models/session.py
# Módulo del modelo de sesión para usuarios anonimos que no estan identificados.
from sqlalchemy import Column, String, Integer, DateTime
from core.database import Base

class AnonymousSession(Base):
    __tablename__ = "sesiones_anonimas"
    id = Column(String(36), primary_key=True, index=True)  # UUID
    consultas_restantes = Column(Integer, default=100)
    ultima_actividad = Column(DateTime, nullable=True)
    ultima_ip = Column(String(45), nullable=True)