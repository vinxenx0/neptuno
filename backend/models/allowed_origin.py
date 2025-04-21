# backend/models/allowed_origin.py
# Modelo de orígenes permitidos para CORS

from sqlalchemy import Column, Integer, String
from models.user import Base

class AllowedOrigin(Base):
    __tablename__ = "allowed_origins"
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String(255), unique=True, nullable=False)  # Ejemplo: "https://thirdparty.com"