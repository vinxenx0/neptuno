# neptuno/sdk/client.py
import httpx
from sdk.config import settings
from sdk.exceptions import UnauthorizedError

def get_http_client():
    return httpx.Client(base_url=settings.base_url, headers=settings.headers)

def post(path, json):
    client = get_http_client()
    response = client.post(path, json=json)
    if response.status_code == 401:
        raise UnauthorizedError("Token inválido o expirado")
    response.raise_for_status()
    return response.json()
