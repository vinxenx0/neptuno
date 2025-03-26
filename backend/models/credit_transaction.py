#backend/models/credit_transaction.py
# backend/models/credit_transaction.py
from sqlalchemy import CheckConstraint, Column, Integer, String, ForeignKey, DateTime, Float
from models.user import Base
from datetime import datetime


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36),
                        ForeignKey("sesiones_anonimas.id"),
                        nullable=True)
    user_type = Column(String(20), nullable=False) #, default="anonymous") # "registered" o "anonymous"
    amount = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    payment_amount = Column(Float, nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(String(20), default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Restricción para asegurar que solo uno de user_id o session_id esté presente
    __table_args__ = (CheckConstraint(
        "(user_id IS NOT NULL AND session_id IS NULL AND user_type = 'registered') OR "
        "(user_id IS NULL AND session_id IS NOT NULL AND user_type = 'anonymous')",
        name="check_user_or_session"), )
