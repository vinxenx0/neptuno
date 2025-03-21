# backend/core/security.py
# Usar OAuth2 con Password Flow para autenticación segur

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jwt import encode, decode, PyJWTError
from os import getenv
from datetime import datetime, timedelta
from typing import Optional

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/token")

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = encode(to_encode, getenv("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        return decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])
    except PyJWTError:
        return None