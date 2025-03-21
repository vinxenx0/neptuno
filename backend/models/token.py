# backend/models/token.py
# modelo para tokens revocados

from sqlalchemy import Column, Integer, String, DateTime
from core.database import Base
from datetime import datetime

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    
    token = Column(String(500), primary_key=True)  # Token JWT completo
    revoked_at = Column(DateTime, default=datetime.utcnow)  # Fecha de revocación
    user_id = Column(Integer, nullable=True)  # ID del usuario asociado (opcional)