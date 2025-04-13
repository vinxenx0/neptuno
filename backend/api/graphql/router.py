from fastapi import APIRouter, Depends, Request
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from core.database import get_db
from dependencies.auth import get_user_context

async def get_context(
    request: Request,
    db=Depends(get_db)
):
    user = await get_user_context(request, db)
    return {
        "request": request,
        "db": db,
        "user": user
    }

router = APIRouter()
graphql_router = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True
)

router.include_router(graphql_router, prefix="/graphql")


# backend/api/v1/graphql/router.py
from fastapi import APIRouter, Depends, Request
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from core.database import get_db
from dependencies.auth import get_user_context

async def get_context(
    request: Request,
    db: Session = Depends(get_db)
):
    return {
        "request": request,
        "db": db,
        "user": await get_user_context(request, db)
    }

router = APIRouter()
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True
)

router.include_router(graphql_app, prefix="/graphql")


# backend/api/v1/graphql/router.py
from fastapi import APIRouter, Depends, Request
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from core.database import get_db
from dependencies.auth import get_user_context
from services.user_service import get_user_info, update_user, delete_user, list_users
from services.gamification_service import (
    create_event_type, get_badges_for_event, get_event_details,
    get_event_types, get_rankings, get_user_events, get_user_gamification,
    get_user_progress_for_event, register_event, update_event_type,
    delete_event_type, create_badge, get_badges, update_badge, delete_badge
)

async def get_context(
    request: Request,
    db: Session = Depends(get_db)
):
    user = await get_user_context(request, db)
    return {
        "request": request,
        "db": db,
        "user": user,
        "user_service": {
            "get_user_info": get_user_info,
            "update_user": update_user,
            "delete_user": delete_user,
            "list_users": list_users
        },
        "gamification_service": {
            "create_event_type": create_event_type,
            "get_badges_for_event": get_badges_for_event,
            "get_event_details": get_event_details,
            "get_event_types": get_event_types,
            "get_rankings": get_rankings,
            "get_user_events": get_user_events,
            "get_user_gamification": get_user_gamification,
            "get_user_progress_for_event": get_user_progress_for_event,
            "register_event": register_event,
            "update_event_type": update_event_type,
            "delete_event_type": delete_event_type,
            "create_badge": create_badge,
            "get_badges": get_badges,
            "update_badge": update_badge,
            "delete_badge": delete_badge
        }
    }

router = APIRouter()
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True
)

router.include_router(graphql_app, prefix="/graphql")


# backend/api/v1/graphql/router.py
from fastapi import APIRouter, Depends, Request
from strawberry.fastapi import GraphQLRouter
from .schema import schema
from core.database import get_db
from dependencies.auth import get_user_context
from services.user_service import get_user_info, update_user, delete_user, list_users
from services.gamification_service import (
    create_event_type, get_badges_for_event, get_event_details,
    get_event_types, get_rankings, get_user_events, get_user_gamification,
    get_user_progress_for_event, register_event, update_event_type,
    delete_event_type, create_badge, get_badges, update_badge, delete_badge
)
from services.settings_service import get_all_settings, set_setting, update_setting, get_setting
from services.payment_service import (
    purchase_credits, add_payment_method, get_payment_methods,
    set_default_payment_method, get_credit_transactions,
    update_payment_method, delete_payment_method
)
from services.payment_provider_service import (
    create_payment_provider, get_payment_providers,
    update_payment_provider, delete_payment_provider
)
from services.coupon_service import (
    create_coupon, get_user_coupons, get_all_coupons,
    update_coupon, delete_coupon, redeem_coupon,
    create_coupon_type, get_coupon_types, create_test_coupon,
    get_coupon_activity
)

async def get_context(
    request: Request,
    db: Session = Depends(get_db)
):
    user = await get_user_context(request, db)
    return {
        "request": request,
        "db": db,
        "user": user,
        "user_service": {
            "get_user_info": get_user_info,
            "update_user": update_user,
            "delete_user": delete_user,
            "list_users": list_users
        },
        "gamification_service": {
            "create_event_type": create_event_type,
            "get_badges_for_event": get_badges_for_event,
            "get_event_details": get_event_details,
            "get_event_types": get_event_types,
            "get_rankings": get_rankings,
            "get_user_events": get_user_events,
            "get_user_gamification": get_user_gamification,
            "get_user_progress_for_event": get_user_progress_for_event,
            "register_event": register_event,
            "update_event_type": update_event_type,
            "delete_event_type": delete_event_type,
            "create_badge": create_badge,
            "get_badges": get_badges,
            "update_badge": update_badge,
            "delete_badge": delete_badge
        },
        "settings_service": {
            "get_all_settings": get_all_settings,
            "set_setting": set_setting,
            "update_setting": update_setting,
            "get_setting": get_setting
        },
        "payment_service": {
            "purchase_credits": purchase_credits,
            "add_payment_method": add_payment_method,
            "get_payment_methods": get_payment_methods,
            "set_default_payment_method": set_default_payment_method,
            "get_credit_transactions": get_credit_transactions,
            "update_payment_method": update_payment_method,
            "delete_payment_method": delete_payment_method
        },
        "payment_provider_service": {
            "create_payment_provider": create_payment_provider,
            "get_payment_providers": get_payment_providers,
            "update_payment_provider": update_payment_provider,
            "delete_payment_provider": delete_payment_provider
        },
        "coupon_service": {
            "create_coupon": create_coupon,
            "get_user_coupons": get_user_coupons,
            "get_all_coupons": get_all_coupons,
            "update_coupon": update_coupon,
            "delete_coupon": delete_coupon,
            "redeem_coupon": redeem_coupon,
            "create_coupon_type": create_coupon_type,
            "get_coupon_types": get_coupon_types,
            "create_test_coupon": create_test_coupon,
            "get_coupon_activity": get_coupon_activity
        }
    }

router = APIRouter()
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True
)

router.include_router(graphql_app, prefix="/graphql")