# backend/models/user.py
# Módulo del modelo de usuario.
from datetime import datetime
from sqlalchemy import Column, Float, Integer, String, DateTime, Boolean, Enum
from core.database import Base
from sqlalchemy.orm import relationship
import enum

class subscriptionEnum(enum.Enum):
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
    subscription = Column(Enum(subscriptionEnum), default=subscriptionEnum.FREEMIUM)  # subscription de suscripción
    #ciudad = Column(String(100), nullable=True)  # Para perfil
    website = Column(String(255), nullable=True)  # URL de avatar o perfil
    credits = Column(Integer, default=10)  # Créditos disponibles
    #create_at = Column(DateTime, default=datetime.utcnow)  # Fecha de registro
    renewal = Column(DateTime, nullable=True)  # Última renovación de créditos
    last_ip = Column(String(45), nullable=True)  # Última IP conocida (IPv4/IPv6)
    last_login = Column(DateTime, nullable=True)  # Último inicio de sesión
    token_valid_until = Column(DateTime, nullable=True)  # Fecha de expiración del token actual
    
    
    gamification_events = relationship("GamificationEvent", back_populates="user")
    gamification = relationship("UserGamification", back_populates="user")
    

    # Añadir relaciones inversas en los modelos existentes
    coupons = relationship("Coupon", foreign_keys="Coupon.user_id", back_populates="user")

    
      # 📌 Ubicación y demografía
    #pais = Column(String(100), nullable=True)  
    ciudad = Column(String(100), nullable=True)  
    #zona_horaria = Column(String(50), nullable=True)  
    #idioma = Column(String(20), nullable=True)  

    # 📌 Datos de empresa
    #empresa = Column(String(255), nullable=True)  
    #industria = Column(String(100), nullable=True)  
    #tamaño_empresa = Column(String(50), nullable=True)  # Startup, PYME, Enterprise
    #num_empleados = Column(Integer, nullable=True)  
    #ingresos_anuales = Column(Float, nullable=True)  
    #presupuesto_estimado = Column(Float, nullable=True)  

    # 📌 Datos técnicos y uso
    #tecnologias_usadas = Column(String(255), nullable=True)  
    #nivel_digitalizacion = Column(String(50), nullable=True)  
    #dispositivo_frecuente = Column(String(50), nullable=True)  
    #engagement = Column(Float, nullable=True)  # % de funciones utilizadas  
    #tiempo_en_plataforma = Column(Integer, nullable=True)  # Minutos activos por mes  

    # 📌 Ciclo de vida
    create_at = Column(DateTime, default=datetime.utcnow)  
    #ultima_actividad = Column(DateTime, nullable=True)  
    #historial_pagos = Column(String(255), nullable=True)  
    #probabilidad_churn = Column(Float, nullable=True)  

    # 📌 Datos comerciales
    #volumen_transacciones = Column(Float, nullable=True)  
    #origen_lead = Column(String(100), nullable=True)  
    #clientes_referidos = Column(Integer, nullable=True)  