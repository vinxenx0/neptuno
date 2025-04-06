# backend/models/payment_provider.py
from sqlalchemy import Column, Integer, String, Boolean
from models.user import Base

class PaymentProvider(Base):
    __tablename__ = "payment_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ej: "Stripe", "Paypal"
    active = Column(Boolean, default=True)  # Si está activo o no