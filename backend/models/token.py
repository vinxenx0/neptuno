# backend/models/token.py
# Modelo para tokens revocados y de reseteo de contraseña

from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from core.database import Base
from datetime import datetime, timedelta

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    
    token = Column(String(500), primary_key=True)  # Token JWT completo
    revoked_at = Column(DateTime, default=datetime.utcnow)  # Fecha de revocación
    user_id = Column(Integer, nullable=True)  # ID del usuario asociado (opcional)
    
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=1))  # Expira en 1 hora