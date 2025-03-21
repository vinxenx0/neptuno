# backend/api/v1/auth.py
# Módulo de autenticación de la API v1.
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.orm import Session
from services.auth_service import (
    login_user, login_with_provider, register_user, get_user_info, update_user, 
    delete_user, request_password_reset, refresh_access_token, logout_user
)
from core.database import get_db
from core.security import get_oauth2_redirect_url, oauth2_scheme, OAuth2PasswordRequestForm
from dependencies.auth import UserContext, get_user_context
from core.logging import configure_logging
from pydantic import BaseModel

router = APIRouter()
logger = configure_logging()

@router.post("/token")
def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        ip = request.client.host
        return login_user(db, form_data.username, form_data.password, ip)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(f"Error inesperado en login desde IP {request.client.host}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar el login")

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    ciudad: str = None
    url: str = None

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, data.email, data.username, data.password, data.ciudad, data.url)

@router.get("/me")
def get_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    user_info = get_user_info(db, int(user.user_id))
    return {
        "id": user_info.id,
        "email": user_info.email,
        "username": user_info.username,
        "rol": user_info.rol,
        "activo": user_info.activo,
        "plan": user_info.plan.value,
        "ciudad": user_info.ciudad,
        "url": user_info.url,
        "consultas_restantes": user_info.consultas_restantes,
        "fecha_creacion": user_info.fecha_creacion,
        "ultima_ip": user_info.ultima_ip
    }

class UpdateProfileRequest(BaseModel):
    email: str | None = None
    username: str | None = None
    ciudad: str | None = None
    url: str | None = None

@router.put("/me")
def update_me(
    request: UpdateProfileRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    updated_user = update_user(
        db,
        int(user.user_id),
        request.email,
        request.username,
        request.ciudad,
        request.url
    )
    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "username": updated_user.username,
        "rol": updated_user.rol,
        "activo": updated_user.activo,
        "plan": updated_user.plan.value,
        "ciudad": updated_user.ciudad,
        "url": updated_user.url,
        "consultas_restantes": updated_user.consultas_restantes,
        "fecha_creacion": updated_user.fecha_creacion,
        "ultima_ip": updated_user.ultima_ip
    }

@router.delete("/me")
def delete_me(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return delete_user(db, int(user.user_id))

@router.post("/password-reset")
def reset_password(email: str, db: Session = Depends(get_db)):
    return request_password_reset(db, email)

@router.post("/refresh")
def refresh_token(refresh_token: str = Form(...), db: Session = Depends(get_db)):
    return refresh_access_token(db, refresh_token)

@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return logout_user(db, token)

@router.get("/login/{provider}")
def get_provider_login_url(provider: str):
    try:
        redirect_url = get_oauth2_redirect_url(provider)
        return {"redirect_url": redirect_url}
    except ValueError:
        raise HTTPException(status_code=400, detail="Proveedor no soportado")

@router.post("/login/{provider}/callback")
def provider_callback(provider: str, code: str, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    return login_with_provider(db, provider, code, ip)