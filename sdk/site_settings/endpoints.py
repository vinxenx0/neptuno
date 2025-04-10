from client import request
from models.site_settings import SiteSettingResponse, SiteSettingCreate, UpdateConfigRequest
from typing import List


def get_all() -> List[SiteSettingResponse]:
    result = request("GET", "/v1/site-settings/admin/config")
    return [SiteSettingResponse(**s) for s in result]


def get_one(key: str) -> str:
    return request("GET", f"/v1/site-settings/{key}")


def update_site_setting(key: str, value: str, description: str = None) -> dict:
    return request("PUT", f"/v1/site-settings/{key}", data={
        "value": value,
        "description": description
    })


def update_or_create(data: UpdateConfigRequest) -> dict:
    return request("POST", "/v1/site-settings/admin/config", data=data.dict())


def add_origin(origin: str) -> dict:
    return request("POST", "/v1/site-settings/allowed-origins", data={"origin": origin})
