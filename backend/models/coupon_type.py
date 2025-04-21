# backend/models/coupon_type.py
# Modelo de tipos de cupones para la base de datos
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from core.database import Base
from datetime import datetime

class CouponType(Base):
    __tablename__ = "coupon_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ejemplo: "Bienvenida", "Demostración"
    
    description = Column(String(255), nullable=True)
    credits = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)