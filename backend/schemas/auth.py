from pydantic import BaseModel, EmailStr

# Respuesta de tokens tras autenticación exitosa
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

# Solicitud para refrescar un token
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Solicitud para restablecer contraseña
class PasswordResetRequest(BaseModel):
    email: EmailStr
    
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class LoginRequest(BaseModel):
    username: str  # En este caso, es el email
    password: str
    
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str