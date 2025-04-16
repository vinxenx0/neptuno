# backend/models/guests.py
# Módulo del modelo de sesión para usuarios anonimos que no estan identificados.
#from sqlalchemy import Column, String, Integer, DateTime, Float
#from sqlalchemy.orm import relationship
#from core.database import Base
#from datetime import datetime

#class GuestsSession(Base):
    #__tablename__ = "sesiones_anonimas"
    
    #id = Column(String(36), primary_key=True, index=True)  
    #username = Column(String(50), unique=True, nullable=False)  
    #credits = Column(Integer, default=10)  
    #create_at = Column(DateTime, default=datetime.utcnow)  
    #ultima_actividad = Column(DateTime, nullable=True)  
    #last_ip = Column(String(45), nullable=True)  

    # 📌 Información Inferida
    #probable_pais = Column(String(100), nullable=True)  
    #probable_industria = Column(String(100), nullable=True)  
    #probable_num_empleados = Column(Integer, nullable=True)  
    #probable_ingresos_anuales = Column(Float, nullable=True)  
    #probable_tecnologias_usadas = Column(String(255), nullable=True)  
    #engagement_anonimo = Column(Float, nullable=True)  # % de uso en la sesión  

    # Relación con gamificación
    #gamification_events = relationship("GamificationEvent", back_populates="session")
    #gamification = relationship("UserGamification", back_populates="session")


    #coupons = relationship("Coupon", foreign_keys="Coupon.session_id", back_populates="session")
    
