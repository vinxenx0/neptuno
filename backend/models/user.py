# backend/models/user.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class UserTypeEnum(enum.Enum):
    REGISTERED = "registered"
    ANONYMOUS = "anonymous"

class subscriptionEnum(enum.Enum):
    FREEMIUM = "freemium"
    PREMIUM = "premium"
    CORPORATE = "corporate"

class User(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(UserTypeEnum), default=UserTypeEnum.ANONYMOUS, nullable=False)  # Nuevo campo
    email = Column(String(255), unique=True, index=True, nullable=True)  # Opcional para anónimos
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Opcional para anónimos
    auth_provider = Column(String(20), nullable=True)  # "local", "google", "meta", etc.
    provider_id = Column(String(255), nullable=True)  # ID único del proveedor
    rol = Column(String(20), default="user")  # "user" o "admin"
    activo = Column(Boolean, default=True)  # Estado de la cuenta
    subscription = Column(Enum(subscriptionEnum), default=subscriptionEnum.FREEMIUM)
    website = Column(String(255), nullable=True)
    credits = Column(Integer, default=10)  # Créditos disponibles
    ciudad = Column(String(100), nullable=True)
    create_at = Column(DateTime, default=datetime.utcnow)
    renewal = Column(DateTime, nullable=True)
    last_ip = Column(String(45), nullable=True)
    last_login = Column(DateTime, nullable=True)
    token_valid_until = Column(DateTime, nullable=True)

    # Relaciones
    gamification_events = relationship("GamificationEvent", back_populates="user")
    gamification = relationship("UserGamification", back_populates="user")
    coupons = relationship("Coupon", foreign_keys="Coupon.user_id", back_populates="user")