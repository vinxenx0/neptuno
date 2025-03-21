from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from models.user import Base
from datetime import datetime

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Vinculado a un usuario
    name = Column(String(50), nullable=False)  # "slack", "zapier", "crm_custom"
    webhook_url = Column(String(255), nullable=False)  # URL del webhook externo
    event_type = Column(String(50), nullable=False)  # "credit_usage", "user_login", "payment_added"
    active = Column(Boolean, default=True)  # Estado de la integración
    created_at = Column(DateTime, default=datetime.utcnow)
    last_triggered = Column(DateTime, nullable=True)  # Última vez que se disparó