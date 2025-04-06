# backend/api/v1/payment_providers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.payment_provider_service import (
    create_payment_provider, get_payment_providers, update_payment_provider, delete_payment_provider
)
from schemas.payment import PaymentProviderCreate, PaymentProviderResponse
from typing import List

router = APIRouter(tags=["Payment Providers"])

@router.get("/", response_model=List[PaymentProviderResponse])
def get_providers(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    # Permitir acceso a usuarios registrados y administradores
    if user.user_type != "registered" and user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_payment_providers(db)

@router.get("/", response_model=List[PaymentProviderResponse])
def get_providers(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_payment_providers(db)

@router.put("/{provider_id}", response_model=PaymentProviderResponse)
def update_provider(provider_id: int, provider_update: PaymentProviderCreate, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_payment_provider(db, provider_id, provider_update)

@router.delete("/{provider_id}")
def delete_provider(provider_id: int, user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return delete_payment_provider(db, provider_id)