from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from dependencies.auth import UserContext, get_user_context
from services.settings_service import update_setting, get_setting
from core.database import get_db
from core.logging import configure_logging

router = APIRouter(prefix="/v1/settings", tags=["site_settings"])

logger = configure_logging()

@router.put("/{key}")
def update_site_setting(
    key: str,
    value: str,
    description: str = None,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered" or not db.query(User).filter(User.id == int(user.user_id), User.rol == "admin").first():
        raise HTTPException(status_code=403, detail="Solo administradores")
    return update_setting(db, int(user.user_id), key, value, description)

@router.get("/{key}")
def get_site_setting(key: str, db: Session = Depends(get_db)):
    return get_setting(db, key)