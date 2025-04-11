# sdk/auth/endpoints.py
# sdk/auth/endpoints.py

from sdk.client import request
from sdk.models.auth import (
    LoginRequest, RegisterRequest, TokenResponse, PasswordResetRequest, PasswordResetConfirm,
    RefreshTokenRequest, ChangePasswordRequest
)


def login(data: LoginRequest) -> TokenResponse:
    """Login usando formulario (username/password)"""
    result = request("POST", "/v1/auth/token", data=data.dict(), form=True)
    return TokenResponse(**result)



def register(data: dict) -> TokenResponse:
    result = request("POST", "/v1/auth/register", data=data)  # ← Ya es un dict, no .dict()
    return TokenResponse(**result)


def password_reset(data: PasswordResetRequest) -> dict:
    """Solicitar reset de contraseña por email"""
    return request("POST", "/v1/auth/password-reset", data=data.dict())


def confirm_password_reset(data: PasswordResetConfirm) -> dict:
    """Confirmar reset con token"""
    return request("POST", "/v1/auth/password-reset/confirm", data=data.dict())


def refresh_token(data: RefreshTokenRequest) -> TokenResponse:
    """Refrescar un token expirado"""
    result = request("POST", "/v1/auth/refresh", data=data.dict())
    return TokenResponse(**result)


def logout() -> dict:
    """Cerrar sesión (requiere token en config)"""
    return request("POST", "/v1/auth/logout")


def get_social_login_url(provider: str) -> str:
    """Obtener URL para iniciar login social"""
    result = request("GET", f"/login/{provider}")
    return result["redirect_url"]


def login_with_provider(provider: str, code: str) -> TokenResponse:
    """Finalizar login social con el código de retorno"""
    result = request("POST", f"/login/{provider}/callback", data={"code": code})
    return TokenResponse(**result)


def change_password(data: ChangePasswordRequest) -> dict:
    """Cambiar contraseña del usuario actual"""
    return request("PUT", "/v1/auth/me/password", data=data.dict())
