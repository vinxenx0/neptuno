# backend/core/security.py
# Usar OAuth2 con Password Flow para autenticación segur

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from oauthlib.oauth2 import WebApplicationClient
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jwt import encode, decode, PyJWTError
from os import getenv
from datetime import datetime, timedelta
from typing import Optional
from core.database import get_db
from services.settings_service import get_setting

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")
google_client = WebApplicationClient(getenv("GOOGLE_CLIENT_ID"))
meta_client = WebApplicationClient(getenv("META_CLIENT_ID"))

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_token(user_id: str, user_type: str = "registered"):
    payload = {
        "sub": str(user_id),
        "type": user_type,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, getenv("SECRET_KEY"), algorithm="HS256")

def decode_token(token: str):
    try:
        return jwt.decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])
    except jwt.PyJWTError:
        return None

def create_access_token(data: dict):
    db = next(get_db())
    expiration = get_setting(db, "token_expiration") or 3600
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=expiration)
    to_encode.update({"exp": expire})
    return encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")

def create_refresh_token(data: dict):
    db = next(get_db())
    expiration = get_setting(db, "refresh_token_expiration") or 604800
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=expiration)
    to_encode.update({"exp": expire})
    return encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")

def decode_token(token: str) -> Optional[dict]:
    try:
        return decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])
    except PyJWTError:
        return None
    
    
def get_oauth2_redirect_url(provider: str) -> str:
    if provider == "google":
        return google_client.prepare_request_uri(
            "https://accounts.google.com/o/oauth2/v2/auth",
            redirect_uri=getenv("GOOGLE_REDIRECT_URI"),
            scope=["openid", "email", "profile"]
        )
    elif provider == "meta":
        return meta_client.prepare_request_uri(
            "https://www.facebook.com/v13.0/dialog/oauth",
            redirect_uri=getenv("META_REDIRECT_URI"),
            scope=["email"]
        )
    raise ValueError("Proveedor no soportado")