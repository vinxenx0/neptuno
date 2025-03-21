from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text
from models.user import Base
from datetime import datetime

class ErrorLog(Base):
    __tablename__ = "error_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)  # Usuario asociado (si aplica)
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)  # Sesión anónima (si aplica)
    error_code = Column(Integer, nullable=False)  # Código HTTP (400, 500, etc.)
    message = Column(String(255), nullable=False)  # Mensaje breve
    details = Column(Text, nullable=True)  # Detalles completos del error
    url = Column(String(255), nullable=True)  # URL donde ocurrió
    method = Column(String(10), nullable=True)  # Método HTTP (GET, POST, etc.)
    ip_address = Column(String(45), nullable=True)  # IP del cliente
    created_at = Column(DateTime, default=datetime.utcnow)  # Fecha del error