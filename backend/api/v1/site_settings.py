from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.origin_service import add_allowed_origin
from models.user import User
from dependencies.auth import UserContext, get_user_context
from services.settings_service import get_all_settings, set_setting, update_setting, get_setting
from core.database import get_db
from core.logging import configure_logging

router = APIRouter(prefix="/v1/settings", tags=["site_settings"])

logger = configure_logging()

# Endpoint público para agregar orígenes (ya existente, pero restringido a admins)
@router.post("/allowed-origins")
async def add_origin(
    origin: str,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    allowed_origins = get_setting(db, "allowed_origins") or []
    if origin in allowed_origins:
        raise HTTPException(status_code=400, detail="Origen ya existe")
    allowed_origins.append(origin)
    return set_setting(db, "allowed_origins", allowed_origins, int(user.user_id), "Orígenes permitidos para CORS")

# Endpoints exclusivos para admins
@router.get("/admin/config", response_model=dict)
async def get_config(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    return get_all_settings(db, int(user.user_id))

@router.post("/admin/config")
async def update_config(
    key: str,
    value: dict | list | int | str,
    description: str | None = None,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    return set_setting(db, key, value, int(user.user_id), description)

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