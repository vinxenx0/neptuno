# backend/api/v1/integrations.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.integration import Integration
from dependencies.auth import UserContext, get_user_context
from services.integration_service import add_integration
from core.database import get_db
from pydantic import BaseModel

router = APIRouter(tags=["integrations"])

class CreateIntegrationRequest(BaseModel):
    name: str
    webhook_url: str
    event_type: str

@router.post("/", response_model=dict)
def create_integration(
    request: CreateIntegrationRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    integration = add_integration(db, user.user_id, request.name, request.webhook_url, request.event_type)
    return {
        "id": integration.id,
        "name": integration.name,
        "webhook_url": integration.webhook_url,
        "event_type": integration.event_type,
        "active": integration.active,
        "created_at": integration.created_at,
        "last_triggered": integration.last_triggered
    }

@router.get("/", response_model=List[dict])
def list_integrations(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    if user.rol == "admin":
        integrations = db.query(Integration).all()
    else:
        integrations = db.query(Integration).filter(Integration.user_id == user.user_id).all()
    return [
        {
            "id": i.id,
            "user_id": i.user_id,
            "name": i.name,
            "webhook_url": i.webhook_url,
            "event_type": i.event_type,
            "active": i.active,
            "created_at": i.created_at,
            "last_triggered": i.last_triggered,
        }
        for i in integrations
    ]

@router.put("/{integration_id}", response_model=dict)
def update_integration(
    integration_id: int,
    request: CreateIntegrationRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden editar integraciones")
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integración no encontrada")
    integration.name = request.name
    integration.webhook_url = request.webhook_url
    integration.event_type = request.event_type
    db.commit()
    db.refresh(integration)
    return {
        "id": integration.id,
        "user_id": integration.user_id,
        "name": integration.name,
        "webhook_url": integration.webhook_url,
        "event_type": integration.event_type,
        "active": integration.active,
        "created_at": integration.created_at,
        "last_triggered": integration.last_triggered
    }

@router.delete("/{integration_id}")
def delete_integration(
    integration_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar integraciones")
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Integración no encontrada")
    db.delete(integration)
    db.commit()
    return {"message": "Integración eliminada"}