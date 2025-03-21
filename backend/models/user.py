# backend/models/user.py
# Módulo del modelo de usuario.
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
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), default="user")  # "user", "admin"
    activo = Column(Boolean, default=True)
    plan = Column(Enum(PlanEnum), default=PlanEnum.FREEMIUM)
    ciudad = Column(String(100), nullable=True)
    url = Column(String(255), nullable=True)
    consultas_restantes = Column(Integer, default=100)
    fecha_renovacion = Column(DateTime, nullable=True)
    fecha_creacion = Column(DateTime, nullable=True)
    ultima_ip = Column(String(45), nullable=True)