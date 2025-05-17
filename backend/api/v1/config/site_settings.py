# backend/api/v1/config/site_settings.py
# Endpoints para configuración y orígenes permitidos (CORS)
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from sqlalchemy.orm import Session
from schemas.site_settings import SiteSettingResponse
from services.origin_service import add_allowed_origin, delete_allowed_origin
from models.user import User
from dependencies.auth import UserContext, get_user_context
from services.settings_service import get_all_settings, set_setting, update_setting, get_setting
from core.database import get_db
from core.logging import configure_logging
from pydantic import BaseModel
import json
from typing import Dict, Any, Optional
from fastapi import Body

class EmailConfigUpdateRequest(BaseModel):
    config: Dict[str, Any]
    description: Optional[str] = None

router = APIRouter(tags=["site_settings"])
AVAILABLE_EMAIL_PROVIDERS = ["smtp", "sendgrid", "mailgun", "ses"]

logger = configure_logging()

class AddOriginRequest(BaseModel):
    origin: str


@router.get("/email/status")
def get_email_config_status(user: UserContext = Depends(get_user_context),
                            db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    return {
        "enabled": get_setting(db, "email_enabled") == "true",
        "provider": get_setting(db, "email_provider") or "smtp"
    }


@router.put("/email/provider")
def update_email_provider(provider: str,
                          description: str = None,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    provider = provider.lower()
    if provider not in AVAILABLE_EMAIL_PROVIDERS:
        raise HTTPException(status_code=400, detail="Proveedor no soportado")
    
    return set_setting(db, "email_provider", provider, user.user_id, description)


@router.get("/email/provider")
def get_email_provider_config(user: UserContext = Depends(get_user_context),
                              db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    return {"provider": get_setting(db, "email_provider") or "smtp"}


@router.get("/email/providers")
def list_email_providers():
    return {"available_providers": AVAILABLE_EMAIL_PROVIDERS}


@router.put("/email/enabled")
def update_email_enabled(enabled: bool,
                         user: UserContext = Depends(get_user_context),
                         db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    return set_setting(db, "email_enabled", str(enabled).lower(), user.user_id, "Habilitar o deshabilitar envío de correos")


@router.get("/email/enabled")
def is_email_enabled(user: UserContext = Depends(get_user_context),
                     db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    
    return {"enabled": get_setting(db, "email_enabled") == "true"}


@router.get("/email/config")
def get_full_email_config(user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    keys = [
        "email_enabled", "email_provider",
        "smtp_host", "smtp_port", "smtp_user", "smtp_pass",
        "sendgrid_api_key",
        "mailgun_api_key", "mailgun_domain",
        "aws_access_key", "aws_secret_key", "aws_region",
        "mail_from", "mail_from_name"
    ]

    config = {key: get_setting(db, key) for key in keys}
    return {"email_config": config}


@router.get("/email/config/{key}")
def get_email_config_key(key: str,
                         user: UserContext = Depends(get_user_context),
                         db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    value = get_setting(db, key)
    if value is None:
        raise HTTPException(status_code=404, detail="Clave no encontrada")
    return {key: value}


@router.put("/email/config")
def update_email_config_values(request: EmailConfigUpdateRequest,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    updated = []
    for key, value in request.config.items():
        set_setting(db, key, value, user.user_id, request.description)
        updated.append(key)

    return {"message": "Configuración actualizada", "keys": updated}



@router.post("/allowed-origins")
async def add_origin(request: AddOriginRequest,
                     user: UserContext = Depends(get_user_context),
                     db: Session = Depends(get_db)):
    if not get_setting(db, "allowed_origins"):
        raise HTTPException(status_code=400, detail="CORS no está habilitado")
    return add_allowed_origin(db, request.origin, user.user_id)


@router.delete("/allowed-origins/{origin}")
async def remove_origin(origin: str,
                        user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    if not get_setting(db, "allowed_origins"):
        raise HTTPException(status_code=400, detail="CORS no está habilitado")
    return delete_allowed_origin(db, origin, user.user_id)


@router.get("/admin/config", response_model=List[SiteSettingResponse])
def get_admin_config(user=Depends(get_user_context),
                     db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    return get_all_settings(db, user.user_id)


class UpdateConfigRequest(BaseModel):
    key: str
    value: dict | list | int | str
    description: str | None = None


@router.post("/admin/config")
async def update_config(request: UpdateConfigRequest,
                        user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    return set_setting(db, request.key, request.value, user.user_id,
                       request.description)


@router.put("/{key}")
def update_site_setting(key: str,
                        value: str,
                        description: str = None,
                        user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    if user.user_type != "registered" or not db.query(User).filter(
            User.id == user.user_id, User.rol == "admin").first():
        raise HTTPException(status_code=403, detail="Solo administradores")
    return update_setting(db, user.user_id, key, value, description)


@router.get("/{key}")
def get_site_setting(key: str, db: Session = Depends(get_db)):
    return get_setting(db, key)
