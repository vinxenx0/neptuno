# backend/api/v1/graphql/schema/site_settings.py
import strawberry
from typing import List, Optional
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from models.site_settings import SiteSettings
from schema.site_settings import SiteSettingResponse
from services.settings_service import get_all_settings, set_setting, update_setting, get_setting

@strawberry.type
class SiteSetting:
    id: int
    key: str
    value: str
    description: Optional[str]
    tag: Optional[str]
    updated_by: Optional[int]
    updated_at: str

    @classmethod
    def from_db(cls, setting: SiteSettings):
        return cls(
            id=setting.id,
            key=setting.key,
            value=setting.value,
            description=setting.description,
            tag=setting.tag,
            updated_by=setting.updated_by,
            updated_at=setting.updated_at.isoformat()
        )

@strawberry.input
class UpdateSettingInput:
    key: str
    value: str
    description: Optional[str] = None
    tag: Optional[str] = None

@strawberry.type
class SiteSettingsQueries:
    @strawberry.field
    async def settings(self, info) -> List[SiteSetting]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can view settings")
        settings = get_all_settings(info.context["db"], str(user.user_id))
        return [SiteSetting.from_db(s) for s in settings]

    @strawberry.field
    async def setting(self, info, key: str) -> Optional[SiteSetting]:
        setting = get_setting(info.context["db"], key)
        if not setting:
            return None
        return SiteSetting.from_db(setting)

@strawberry.type
class SiteSettingsMutations:
    @strawberry.mutation
    async def update_setting(
        self,
        info,
        key: str,
        value: str,
        description: Optional[str] = None,
        tag: Optional[str] = None
    ) -> SiteSetting:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can update settings")
        
        updated = update_setting(
            info.context["db"],
            str(user.user_id),
            key,
            value,
            description,
            tag
        )
        # Need to fetch the full setting to return all fields
        setting = get_setting(info.context["db"], key)
        return SiteSetting.from_db(setting)

    @strawberry.mutation
    async def set_setting(
        self,
        info,
        key: str,
        value: str,
        description: Optional[str] = None
    ) -> SiteSetting:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can set settings")
        
        set_setting(
            info.context["db"],
            key,
            value,
            str(user.user_id),
            description
        )
        # Need to fetch the full setting to return all fields
        setting = get_setting(info.context["db"], key)
        return SiteSetting.from_db(setting)

    @strawberry.mutation
    async def add_allowed_origin(
        self,
        info,
        origin: str
    ) -> SiteSetting:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can add allowed origins")
        
        allowed_origins = get_setting(info.context["db"], "allowed_origins") or []
        if origin in allowed_origins:
            raise Exception("Origin already exists")
        
        allowed_origins.append(origin)
        set_setting(
            info.context["db"],
            "allowed_origins",
            allowed_origins,
            str(user.user_id),
            "Allowed origins for CORS"
        )
        return SiteSetting.from_db(get_setting(info.context["db"], "allowed_origins"))

    @strawberry.mutation
    async def remove_allowed_origin(
        self,
        info,
        origin: str
    ) -> SiteSetting:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can remove allowed origins")
        
        allowed_origins = get_setting(info.context["db"], "allowed_origins") or []
        if origin not in allowed_origins:
            raise Exception("Origin not found")
        
        allowed_origins.remove(origin)
        set_setting(
            info.context["db"],
            "allowed_origins",
            allowed_origins,
            str(user.user_id),
            "Allowed origins for CORS"
        )
        return SiteSetting.from_db(get_setting(info.context["db"], "allowed_origins"))