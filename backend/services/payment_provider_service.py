# backend/services/payment_provider_service.py
# Servicio para gestión de proveedores de pago

from sqlalchemy.orm import Session
from models.payment_provider import PaymentProvider
from schemas.payment import PaymentProviderCreate
from fastapi import HTTPException

def create_payment_provider(db: Session, provider: PaymentProviderCreate):
    existing = db.query(PaymentProvider).filter(PaymentProvider.name == provider.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Payment provider already exists")
    db_provider = PaymentProvider(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

def get_payment_providers(db: Session):
    return db.query(PaymentProvider).all()

def update_payment_provider(db: Session, provider_id: int, provider_update: PaymentProviderCreate):
    provider = db.query(PaymentProvider).filter(PaymentProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Payment provider not found")
    for key, value in provider_update.dict().items():
        setattr(provider, key, value)
    db.commit()
    db.refresh(provider)
    return provider

def delete_payment_provider(db: Session, provider_id: int):
    provider = db.query(PaymentProvider).filter(PaymentProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Payment provider not found")
    db.delete(provider)
    db.commit()
    return {"message": "Payment provider deleted"}