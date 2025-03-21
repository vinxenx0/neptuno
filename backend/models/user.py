# backend/models/user.py
# Módulo del modelo de usuario.
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from core.database import Base
import enum

class PlanEnum(enum.Enum):
    FREEMIUM = "freemium"
    PREMIUM = "premium"
    CORPORATE = "corporate"

class User(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable para terceros
    auth_provider = Column(String(20), nullable=True)  # "local", "google", "meta", etc.
    provider_id = Column(String(255), nullable=True)  # ID único del proveedor
    rol = Column(String(20), default="user")  # "user" o "admin"
    activo = Column(Boolean, default=True)  # Estado de la cuenta
    plan = Column(Enum(PlanEnum), default=PlanEnum.FREEMIUM)  # Plan de suscripción
    ciudad = Column(String(100), nullable=True)  # Para perfil
    url = Column(String(255), nullable=True)  # URL de avatar o perfil
    consultas_restantes = Column(Integer, default=100)  # Créditos disponibles
    fecha_creacion = Column(DateTime, default=datetime.utcnow)  # Fecha de registro
    fecha_renovacion = Column(DateTime, nullable=True)  # Última renovación de créditos
    ultima_ip = Column(String(45), nullable=True)  # Última IP conocida (IPv4/IPv6)
    ultimo_login = Column(DateTime, nullable=True)  # Último inicio de sesión
    token_valid_until = Column(DateTime, nullable=True)  # Fecha de expiración del token actual