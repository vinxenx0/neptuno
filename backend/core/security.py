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
from core.logging import configure_logging
from core.database import get_db
from services.settings_service import get_setting

logger = configure_logging()

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

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])
        # Validación adicional del payload
        if not payload.get("sub") or not payload.get("type"):
            logger.warning(f"Token inválido: falta sub o type en el payload")
            return None
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expirado")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Token inválido: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error inesperado al decodificar token: {str(e)}")
        return None

def create_access_token(data: dict):
    db = next(get_db())
    try:
        # Validar y convertir a entero
        expiration = int(get_setting(db, "token_expiration") or "3600")
        if expiration < 300:  # Mínimo 5 minutos
            expiration = 3600
            logger.warning("Token expiration too low, using default 1h")
    except Exception as e:
        logger.error(f"Error token_expiration: {str(e)}")
        expiration = 3600
    
    expire = datetime.utcnow() + timedelta(seconds=expiration)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")

def create_refresh_token(data: dict):
    db = next(get_db())
    try:
        # Validar y convertir a entero
        expiration = int(get_setting(db, "refresh_token_expiration") or "604800")
        if expiration < 86400:  # Mínimo 1 día
            expiration = 604800
            logger.warning("Refresh token expiration too low, using default 7d")
    except Exception as e:
        logger.error(f"Error refresh_token_expiration: {str(e)}")
        expiration = 604800
    
    expire = datetime.utcnow() + timedelta(seconds=expiration)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")


def create_refresh_token(data: dict):
    db = next(get_db())
    expiration_str = get_setting(db, "refresh_token_expiration") or "604800"  # Valor por defecto: 7 días
    try:
        expiration = int(str(expiration_str))  # Convertir a cadena primero y luego a entero
    except ValueError:
        logger.error(f"Valor inválido para refresh_token_expiration: {expiration_str}")
        expiration = 604800  # Valor por defecto si falla
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=expiration)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")

    
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