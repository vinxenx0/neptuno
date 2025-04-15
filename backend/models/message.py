# backend/models/message.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from core.database import Base
from datetime import datetime

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    to_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)