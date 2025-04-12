# sdk/client.py
# sdk/client.py

from os import path
from typing import Optional
import httpx
from sdk.config import settings
from sdk.exceptions import (
    UnauthorizedError, NotFoundError, ServerError, ValidationError, ConflictError, SDKError
)

def request(method: str, path: str, data: Optional[dict] = None, form: bool = False) -> dict:
    url = settings.base_url.rstrip("/") + path
    headers = settings.headers
    headers = settings.headers
    try:
        if form:
            response = httpx.request(method, url, data=data, headers=headers, timeout=settings.timeout)
        else:
            response = httpx.request(method, url, json=data, headers=headers, timeout=settings.timeout)

        response.raise_for_status()

    except httpx.HTTPStatusError as e:
        # Esto asegura que no devolvemos un dict inválido al parsear
        try:
            return {"error": response.json()}
        except Exception:
            return {"error": {"code": response.status_code, "detail": response.text}}
