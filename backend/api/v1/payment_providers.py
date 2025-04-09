# backend/api/v1/payment_providers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.payment_provider_service import (
    create_payment_provider, 
    get_payment_providers, 
    update_payment_provider, 
    delete_payment_provider
)
from schemas.payment import PaymentProviderCreate, PaymentProviderResponse
from typing import List

router = APIRouter(tags=["Payment Providers"])

@router.get(
    "/",
    response_model=List[PaymentProviderResponse],
    summary="Obtener proveedores de pago",
    description="Obtiene la lista de proveedores de pago disponibles"
)
def get_providers(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    # Acceso permitido para usuarios registrados y administradores
    if user.user_type != "registered" and user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso no autorizado"
        )
    return get_payment_providers(db)

@router.post(
    "/",
    response_model=PaymentProviderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo proveedor",
    description="Crea un nuevo proveedor de pagos (solo administradores)"
)
def create_provider(
    provider_data: PaymentProviderCreate,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador"
        )
    return create_payment_provider(db, provider_data)

@router.put(
    "/{provider_id}",
    response_model=PaymentProviderResponse,
    summary="Actualizar proveedor",
    description="Actualiza un proveedor de pagos existente (solo administradores)"
)
def update_provider(
    provider_id: int, 
    provider_update: PaymentProviderCreate,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador"
        )
    return update_payment_provider(db, provider_id, provider_update)

@router.delete(
    "/{provider_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar proveedor",
    description="Elimina un proveedor de pagos (solo administradores)"
)
def delete_provider(
    provider_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador"
        )
    delete_payment_provider(db, provider_id)
    return {"detail": "Proveedor eliminado exitosamente"}