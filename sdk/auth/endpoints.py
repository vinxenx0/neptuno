# sdk/auth/endpoints.py
from sdk.client import post
from sdk.models.auth import LoginRequest, TokenResponse

def login(data: LoginRequest) -> TokenResponse:
    result = post("/token", json=data.dict())
    return TokenResponse(**result)
