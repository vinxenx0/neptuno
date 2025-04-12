# sdk/config.py

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class SDKSettings(BaseSettings):
    base_url: str = Field(default="http://localhost:8000", env="SDK_BASE_URL")
    access_token: Optional[str] = Field(default=None, env="SDK_ACCESS_TOKEN")
    timeout: int = Field(default=10, env="SDK_TIMEOUT")
    session_id: Optional[str] = None  # <-- Añadir para sesiones anónimas
    user_type: str = "registered"     # "registered" | "anonymous"

    @property
    def headers(self) -> dict:
        headers = {"Content-Type": "application/json"}

        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        # Añadido para usuarios anónimos
        if self.session_id:
            headers["x-session-id"] = self.session_id

        if self.user_type:
            headers["x-user-type"] = self.user_type

        return headers


settings = SDKSettings()
