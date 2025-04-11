from typing import List
from sdk.client import request
from sdk.models.gamification import (
    GamificationEventCreate,
    GamificationEventResponse,
    UserGamificationResponse,
    EventTypeCreate,
    EventTypeResponse,
    BadgeCreate,
    BadgeResponse,
    RankingResponse
)


def register_event(event: GamificationEventCreate) -> GamificationEventResponse:
    result = request("POST", "/v1/gamification/events", data=event.dict())
    return GamificationEventResponse(**result)


def get_my_events() -> List[GamificationEventResponse]:
    result = request("GET", "/v1/gamification/events")
    return [GamificationEventResponse(**e) for e in result]


def get_my_gamification() -> List[UserGamificationResponse]:
    result = request("GET", "/v1/gamification/me")
    return [UserGamificationResponse(**r) for r in result]


def get_event_details(event_id: int) -> GamificationEventResponse:
    result = request("GET", f"/v1/gamification/events/{event_id}")
    return GamificationEventResponse(**result)


def get_badges_for_event_type(event_type_id: int) -> List[BadgeResponse]:
    result = request("GET", f"/v1/gamification/event-types/{event_type_id}/badges")
    return [BadgeResponse(**b) for b in result]


def get_progress(event_type_id: int) -> UserGamificationResponse:
    result = request("GET", f"/v1/gamification/progress/{event_type_id}")
    return UserGamificationResponse(**result)


# Admin functions
def create_event_type(data: EventTypeCreate) -> EventTypeResponse:
    result = request("POST", "/v1/gamification/event-types", data=data.dict())
    return EventTypeResponse(**result)


def get_event_types() -> List[EventTypeResponse]:
    result = request("GET", "/v1/gamification/event-types")
    return [EventTypeResponse(**e) for e in result]


def update_event_type(event_type_id: int, data: EventTypeCreate) -> EventTypeResponse:
    result = request("PUT", f"/v1/gamification/event-types/{event_type_id}", data=data.dict())
    return EventTypeResponse(**result)


def delete_event_type(event_type_id: int) -> dict:
    return request("DELETE", f"/v1/gamification/event-types/{event_type_id}")


def create_badge(data: BadgeCreate) -> BadgeResponse:
    result = request("POST", "/v1/gamification/badges", data=data.dict())
    return BadgeResponse(**result)


def get_badges() -> List[BadgeResponse]:
    result = request("GET", "/v1/gamification/badges")
    return [BadgeResponse(**b) for b in result]


def update_badge(badge_id: int, data: BadgeCreate) -> BadgeResponse:
    result = request("PUT", f"/v1/gamification/badges/{badge_id}", data=data.dict())
    return BadgeResponse(**result)


def delete_badge(badge_id: int) -> dict:
    return request("DELETE", f"/v1/gamification/badges/{badge_id}")


def get_rankings() -> List[RankingResponse]:
    result = request("GET", "/v1/gamification/rankings")
    return [RankingResponse(**r) for r in result]
