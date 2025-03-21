# backend/models/token.py
# modelo para tokens revocados

from sqlalchemy import Column, String, DateTime
from core.database import Base
from datetime import datetime

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    token = Column(String(500), primary_key=True)
    revoked_at = Column(DateTime, default=datetime.utcnow)