from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from models.user import Base
from datetime import datetime

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)  # Null para anónimos
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)  # Null para registrados
    amount = Column(Integer, nullable=False)  # Cantidad de créditos (positiva o negativa)
    transaction_type = Column(String(20), nullable=False)  # "usage", "renewal", "purchase"
    created_at = Column(DateTime, default=datetime.utcnow)  # Fecha de la transacción
    description = Column(String(255), nullable=True)  # Detalle opcional