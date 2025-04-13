# backend/api/v1/graphql/schema/gamification.py
import strawberry
from typing import List, Optional
from datetime import datetime
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from schemas.gamification import (
    EventTypeResponse,
    BadgeResponse,
    GamificationEventResponse,
    UserGamificationResponse,
    RankingResponse
)

@strawberry.type
class EventType:
    id: int
    name: str
    description: Optional[str]
    points_per_event: int

    @classmethod
    def from_db(cls, event_type):
        return cls(
            id=event_type.id,
            name=event_type.name,
            description=event_type.description,
            points_per_event=event_type.points_per_event
        )

@strawberry.type
class Badge:
    id: int
    name: str
    description: Optional[str]
    event_type_id: int
    required_points: int
    user_type: str

    @classmethod
    def from_db(cls, badge):
        return cls(
            id=badge.id,
            name=badge.name,
            description=badge.description,
            event_type_id=badge.event_type_id,
            required_points=badge.required_points,
            user_type=badge.user_type
        )

@strawberry.type
class GamificationEvent:
    id: int
    event_type_id: int
    user_id: Optional[int]
    session_id: Optional[str]
    timestamp: str

    @classmethod
    def from_db(cls, event):
        return cls(
            id=event.id,
            event_type_id=event.event_type_id,
            user_id=event.user_id,
            session_id=event.session_id,
            timestamp=event.timestamp.isoformat()
        )

@strawberry.type
class UserGamification:
    id: int
    user_id: Optional[int]
    session_id: Optional[str]
    event_type_id: int
    points: int
    badge_id: Optional[int]

    @classmethod
    def from_db(cls, user_gamification):
        return cls(
            id=user_gamification.id,
            user_id=user_gamification.user_id,
            session_id=user_gamification.session_id,
            event_type_id=user_gamification.event_type_id,
            points=user_gamification.points,
            badge_id=user_gamification.badge_id
        )

@strawberry.type
class Ranking:
    username: str
    points: int
    badges_count: int
    user_type: str

    @classmethod
    def from_db(cls, ranking):
        return cls(
            username=ranking.username,
            points=ranking.points,
            badges_count=ranking.badges_count,
            user_type=ranking.user_type
        )

@strawberry.input
class GamificationEventInput:
    event_type_id: int

@strawberry.input
class EventTypeInput:
    name: str
    description: Optional[str] = None
    points_per_event: int = 0

@strawberry.input
class BadgeInput:
    name: str
    description: Optional[str] = None
    event_type_id: int
    required_points: int
    user_type: str = "both"

@strawberry.type
class GamificationQueries:
    @strawberry.field
    async def rankings(self, info) -> List[Ranking]:
        rankings = info.context["gamification_service"].get_rankings(info.context["db"])
        return [Ranking.from_db(r) for r in rankings]

    @strawberry.field
    async def my_gamification(self, info) -> List[UserGamification]:
        user = await get_user_context(info.context["request"], info.context["db"])
        gamification = info.context["gamification_service"].get_user_gamification(info.context["db"], user)
        return [UserGamification.from_db(g) for g in gamification]

    @strawberry.field
    async def my_events(self, info) -> List[GamificationEvent]:
        user = await get_user_context(info.context["request"], info.context["db"])
        events = info.context["gamification_service"].get_user_events(info.context["db"], user)
        return [GamificationEvent.from_db(e) for e in events]

    @strawberry.field
    async def event(self, info, event_id: int) -> Optional[GamificationEvent]:
        user = await get_user_context(info.context["request"], info.context["db"])
        event = info.context["gamification_service"].get_event_details(info.context["db"], event_id, user)
        return GamificationEvent.from_db(event) if event else None

    @strawberry.field
    async def my_progress(self, info, event_type_id: int) -> Optional[UserGamification]:
        user = await get_user_context(info.context["request"], info.context["db"])
        progress = info.context["gamification_service"].get_user_progress_for_event(
            info.context["db"], user, event_type_id
        )
        return UserGamification.from_db(progress) if progress else None

    @strawberry.field
    async def event_badges(self, info, event_type_id: int) -> List[Badge]:
        badges = info.context["gamification_service"].get_badges_for_event(
            info.context["db"], event_type_id
        )
        return [Badge.from_db(b) for b in badges]

    @strawberry.field
    async def event_types(self, info) -> List[EventType]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can list event types")
        event_types = info.context["gamification_service"].get_event_types(info.context["db"])
        return [EventType.from_db(et) for et in event_types]

    @strawberry.field
    async def badges(self, info) -> List[Badge]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can list badges")
        badges = info.context["gamification_service"].get_badges(info.context["db"])
        return [Badge.from_db(b) for b in badges]

@strawberry.type
class GamificationMutations:
    @strawberry.mutation
    async def register_event(self, info, input: GamificationEventInput) -> GamificationEvent:
        user = await get_user_context(info.context["request"], info.context["db"])
        event = info.context["gamification_service"].register_event(
            info.context["db"],
            GamificationEventCreate(event_type_id=input.event_type_id),
            user
        )
        return GamificationEvent.from_db(event)

    @strawberry.mutation
    async def create_event_type(self, info, input: EventTypeInput) -> EventType:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create event types")
        
        event_type = info.context["gamification_service"].create_event_type(
            info.context["db"],
            EventTypeCreate(
                name=input.name,
                description=input.description,
                points_per_event=input.points_per_event
            )
        )
        return EventType.from_db(event_type)

    @strawberry.mutation
    async def update_event_type(
        self,
        info,
        event_type_id: int,
        input: EventTypeInput
    ) -> EventType:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can update event types")
        
        event_type = info.context["gamification_service"].update_event_type(
            info.context["db"],
            event_type_id,
            EventTypeCreate(
                name=input.name,
                description=input.description,
                points_per_event=input.points_per_event
            )
        )
        return EventType.from_db(event_type)

    @strawberry.mutation
    async def delete_event_type(self, info, event_type_id: int) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can delete event types")
        
        info.context["gamification_service"].delete_event_type(
            info.context["db"], event_type_id
        )
        return True

    @strawberry.mutation
    async def create_badge(self, info, input: BadgeInput) -> Badge:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create badges")
        
        badge = info.context["gamification_service"].create_badge(
            info.context["db"],
            BadgeCreate(
                name=input.name,
                description=input.description,
                event_type_id=input.event_type_id,
                required_points=input.required_points,
                user_type=input.user_type
            )
        )
        return Badge.from_db(badge)

    @strawberry.mutation
    async def update_badge(
        self,
        info,
        badge_id: int,
        input: BadgeInput
    ) -> Badge:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can update badges")
        
        badge = info.context["gamification_service"].update_badge(
            info.context["db"],
            badge_id,
            BadgeCreate(
                name=input.name,
                description=input.description,
                event_type_id=input.event_type_id,
                required_points=input.required_points,
                user_type=input.user_type
            )
        )
        return Badge.from_db(badge)

    @strawberry.mutation
    async def delete_badge(self, info, badge_id: int) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can delete badges")
        
        info.context["gamification_service"].delete_badge(
            info.context["db"], badge_id
        )
        return True