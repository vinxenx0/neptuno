#backend/models/credit_transaction.py
# backend/models/credit_transaction.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from models.user import Base
from datetime import datetime

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36), nullable=True)  # Para sesiones anónimas
    amount = Column(Integer, nullable=False)  # Créditos (positivo o negativo)
    transaction_type = Column(String(50), nullable=False)  # "usage", "purchase", "reset"
    description = Column(String(255), nullable=True)  # Nuevo campo para descripción
    payment_amount = Column(Float, nullable=True)  # Monto en dinero (ej. 9.99)
    payment_method = Column(String(50), nullable=True)  # "stripe", "paypal", etc.
    payment_status = Column(String(20), default="pending")  # "pending", "completed", "failed"
    timestamp = Column(DateTime, default=datetime.utcnow)