# backend/api/v1/graphql/schema/__init__.py
import strawberry
from .user import UserQueries, UserMutations
from .gamification import GamificationQueries, GamificationMutations
from .site_settings import SiteSettingsQueries, SiteSettingsMutations
from .payment import PaymentQueries, PaymentMutations
from .payment_providers import PaymentProviderQueries, PaymentProviderMutations
from .coupons import CouponQueries, CouponMutations

@strawberry.type
class Query(
    UserQueries,
    GamificationQueries,
    SiteSettingsQueries,
    PaymentQueries,
    PaymentProviderQueries,
    CouponQueries
):
    pass

@strawberry.type
class Mutation(
    UserMutations,
    GamificationMutations,
    SiteSettingsMutations,
    PaymentMutations,
    PaymentProviderMutations,
    CouponMutations
):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)