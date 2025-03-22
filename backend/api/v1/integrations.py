# backend/api/v1/integrations.py
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

@router.post("/")
def create_integration(
    request: CreateIntegrationRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return add_integration(db, user.user_id, request.name, request.webhook_url, request.event_type)

@router.get("/")
def list_integrations(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    integrations = db.query(Integration).filter(Integration.user_id == user.user_id).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "webhook_url": i.webhook_url,
            "event_type": i.event_type,
            "active": i.active,
            "created_at": i.created_at,
            "last_triggered": i.last_triggered,
        }
        for i in integrations
    ]