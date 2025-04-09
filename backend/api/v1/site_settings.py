# backend/api/v1/site_settings.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.site_settings import SiteSettingResponse
from services.origin_service import add_allowed_origin
from models.user import User
from dependencies.auth import UserContext, get_user_context
from services.settings_service import get_all_settings, set_setting, update_setting, get_setting
from core.database import get_db
from core.logging import configure_logging
from pydantic import BaseModel

router = APIRouter(tags=["site_settings"])

logger = configure_logging()


class AddOriginRequest(BaseModel):
    origin: str


@router.post("/allowed-origins")
async def add_origin(request: AddOriginRequest,
                     user: UserContext = Depends(get_user_context),
                     db: Session = Depends(get_db)):
    """
    Add a new allowed origin for CORS.

    Args:
        request (AddOriginRequest): The request body containing the origin to add.
        user (UserContext): The user context, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: The updated list of allowed origins.

    Raises:
        HTTPException: If the origin already exists in the allowed origins list.
    """
    origin = request.origin
    allowed_origins = get_setting(db, "allowed_origins") or []
    if origin in allowed_origins:
        raise HTTPException(status_code=400, detail="Origen ya existe")
    allowed_origins.append(origin)
    return set_setting(db, "allowed_origins", allowed_origins, user.user_id,
                       "Orígenes permitidos para CORS")


@router.get("/admin/config", response_model=List[SiteSettingResponse])
def get_admin_config(user=Depends(get_user_context),
                     db: Session = Depends(get_db)):
    """
    Retrieve all site settings for administrators.

    Args:
        user (UserContext): The user context, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        List[SiteSettingResponse]: A list of all site settings.

    Raises:
        HTTPException: If the user is not an administrator.
    """
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
    """
    Update or create a site setting.

    Args:
        request (UpdateConfigRequest): The request body containing the key, value, and optional description.
        user (UserContext): The user context, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: The updated or newly created site setting.
    """
    return set_setting(db, request.key, request.value, user.user_id,
                       request.description)


@router.put("/{key}")
def update_site_setting(key: str,
                        value: str,
                        description: str = None,
                        user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    """
    Update an existing site setting.

    Args:
        key (str): The key of the setting to update.
        value (str): The new value for the setting.
        description (str, optional): A description of the setting. Defaults to None.
        user (UserContext): The user context, injected via dependency.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: The updated site setting.

    Raises:
        HTTPException: If the user is not an administrator or does not have the required permissions.
    """
    if user.user_type != "registered" or not db.query(User).filter(
            User.id == user.user_id, User.rol == "admin").first():
        raise HTTPException(status_code=403, detail="Solo administradores")
    return update_setting(db, user.user_id, key, value, description)


@router.get("/{key}")
def get_site_setting(key: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific site setting by key.

    Args:
        key (str): The key of the setting to retrieve.
        db (Session): The database session, injected via dependency.

    Returns:
        Any: The value of the requested site setting.
    """
    return get_setting(db, key)
