# sdk/config.py

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class SDKSettings(BaseSettings):
    base_url: str = Field(default="http://localhost:8000", env="SDK_BASE_URL")
    access_token: Optional[str] = Field(default=None, env="SDK_ACCESS_TOKEN")
    timeout: int = Field(default=10, env="SDK_TIMEOUT")

    @property
    def headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers

settings = SDKSettings()
