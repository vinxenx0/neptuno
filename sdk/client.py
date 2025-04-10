# sdk/client.py
# sdk/client.py

import httpx
from config import settings
from exceptions import (
    UnauthorizedError, NotFoundError, ServerError, ValidationError, ConflictError, SDKError
)

def request(method: str, path: str, data: dict = None, form: bool = False) -> dict:
    url = settings.base_url + path

    headers = settings.headers.copy()

    # Si es formulario, se espera application/x-www-form-urlencoded
    if form:
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    try:
        response = httpx.request(
            method=method.upper(),
            url=url,
            headers=headers,
            timeout=settings.timeout,
            json=None if form else data,
            data=data if form else None,
        )

        if response.status_code == 401:
            raise UnauthorizedError("Unauthorized")
        elif response.status_code == 404:
            raise NotFoundError("Resource not found")
        elif response.status_code == 409:
            raise ConflictError("Conflict occurred")
        elif response.status_code == 422:
            raise ValidationError(response.text)
        elif 500 <= response.status_code < 600:
            raise ServerError("Internal server error")

        return response.json()
    except httpx.RequestError as e:
        raise SDKError(f"Network error: {str(e)}")
