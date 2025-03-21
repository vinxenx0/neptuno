from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from services.integration_service import add_integration
from core.database import get_db

router = APIRouter(prefix="/v1/integrations", tags=["integrations"])

@router.post("/")
def create_integration(
    name: str,
    webhook_url: str,
    event_type: str,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return add_integration(db, int(user.user_id), name, webhook_url, event_type)