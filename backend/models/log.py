from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from models.user import Base
from datetime import datetime

class APILog(Base):
    __tablename__ = "api_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)  # GET, POST, etc.
    status_code = Column(Integer, nullable=False)
    request_data = Column(Text, nullable=True)  # JSON serializado
    response_data = Column(Text, nullable=True)  # JSON serializado
    timestamp = Column(DateTime, default=datetime.utcnow)