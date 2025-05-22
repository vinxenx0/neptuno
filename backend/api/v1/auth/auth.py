# backend/api/v1/auth.py
# Endpoints de autenticación y registro de usuarios (v1)

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from services.settings_service import get_setting
from schemas.auth import (ChangePasswordRequest, PasswordResetConfirm,
                          TokenResponse, RefreshTokenRequest,
                          PasswordResetRequest)
from schemas.user import RegisterRequest
from services.auth_service import (login_user, register_user,
                                   refresh_access_token, logout_user,
                                   request_password_reset,
                                   confirm_password_reset,
                                   change_user_password, login_with_provider)
from core.database import get_db
from core.security import oauth2_scheme, OAuth2PasswordRequestForm
from core.security import get_oauth2_redirect_url
from dependencies.auth import UserContext, get_user_context
from core.logging import configure_logging

router = APIRouter(tags=["auth"])
logger = configure_logging()


@router.post("/token", response_model=TokenResponse)
def login_for_access_token(request: Request,
                           form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):
    try:
        ip = request.client.host
        return login_user(db, form_data.username, form_data.password, ip)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.critical(
            f"Error inesperado en login desde IP {request.client.host}: {str(e)}"
        )
        raise HTTPException(status_code=500,
                            detail="Error al procesar el login")


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    enable_registration = get_setting(db, "enable_registration")
    if enable_registration != "true":
        raise HTTPException(
            status_code=403,
            detail="El registro de nuevos usuarios está deshabilitado")
    return register_user(db, data.email, data.username, data.password)


@router.post("/password-reset", response_model=dict)
def reset_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    return request_password_reset(db, data.email)


@router.post("/password-reset/confirm", response_model=dict)
def confirm_password_reset(data: PasswordResetConfirm,
                           db: Session = Depends(get_db)):
    return confirm_password_reset(db, data.token, data.new_password)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request,
                  data: RefreshTokenRequest,
                  db: Session = Depends(get_db)):
    try:
        logger.info(
            f"Intento de refresco de token desde IP {request.client.host}")
        result = refresh_access_token(db, data.refresh_token)
        logger.info("Refresco de token exitoso")
        return result
    except HTTPException as e:
        logger.error(f"Error al refrescar token: {e.detail}")
        raise
    except Exception as e:
        logger.critical(f"Error inesperado en refresh_token: {str(e)}",
                        exc_info=True)
        raise HTTPException(status_code=500,
                            detail="Error interno del servidor")


@router.post("/logout", response_model=dict)
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return logout_user(db, token)


# Ruta para login con OAuth2
@router.get("/login/{provider}", response_model=dict)
def get_provider_login_url(provider: str, db: Session = Depends(get_db)):
    enable_social_login = get_setting(db, "enable_social_login")
    if enable_social_login != "true":
        raise HTTPException(status_code=403, detail="El login social está deshabilitado")
    try:
        redirect_url = get_oauth2_redirect_url(provider, is_register=False)
        return {"redirect_url": redirect_url}
    except ValueError:
        raise HTTPException(status_code=400, detail="Proveedor no soportado")

# Ruta para registro con OAuth2
@router.get("/register/{provider}", response_model=dict)
def get_provider_register_url(provider: str, db: Session = Depends(get_db)):
    enable_registration = get_setting(db, "enable_registration")
    if enable_registration != "true":
        raise HTTPException(status_code=403, detail="El registro está deshabilitado")
    try:
        redirect_url = get_oauth2_redirect_url(provider, is_register=True)
        return {"redirect_url": redirect_url}
    except ValueError:
        raise HTTPException(status_code=400, detail="Proveedor no soportado")

# Callback para login
@router.post("/login/{provider}/callback", response_model=TokenResponse)
def provider_login_callback(provider: str, code: str, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    return login_with_provider(db, provider, code, ip, is_register=False)

# Callback para registro
@router.post("/register/{provider}/callback", response_model=TokenResponse)
def provider_register_callback(provider: str, code: str, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    return login_with_provider(db, provider, code, ip, is_register=True)


@router.put("/me/password", response_model=dict)
def change_password(data: ChangePasswordRequest,
                    user: UserContext = Depends(get_user_context),
                    db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden cambiar su contraseña")
    return change_user_password(db, int(user.user_id), data.current_password,
                                data.new_password)
