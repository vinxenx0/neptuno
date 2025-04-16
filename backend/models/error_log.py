#backend/models/error_log.py
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text
from models.user import Base
from datetime import datetime


class ErrorLog(Base):
    __tablename__ = "error_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36),
                        ForeignKey("usuarios.id"),
                        nullable=True)
    user_type = Column(String(20), nullable=False, default="anonymous")

    error_code = Column(Integer, nullable=False)
    message = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    url = Column(String(255), nullable=True)
    method = Column(String(10), nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
