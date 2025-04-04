# backend/models/payment_method.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from models.user import Base
from datetime import datetime

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Vinculado a un usuario
    payment_type = Column(String(20), nullable=False)  # "credit_card", "paypal", "bank_transfer"
    details = Column(String(255), nullable=False)  # Datos encriptados (ej. últimos 4 dígitos, email PayPal)
    is_default = Column(Boolean, default=False)  # Método favorito
    created_at = Column(DateTime, default=datetime.utcnow)  # Fecha de creación
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Última actualización