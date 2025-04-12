# 
from sdk.client import request
from sdk.models.guest import GuestsSessionResponse

def get_credits() -> dict:
    """Obtener créditos de sesión anónima actual"""
    return request("GET", "/v1/sessions/credits")

def list_sessions(page: int = 1, limit: int = 10) -> dict:
    """Solo admin: Listado de sesiones anónimas"""
    return request("GET", "/v1/sessions", params={"page": page, "limit": limit})
