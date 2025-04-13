# backend/api/v1/graphql/schema/payment_providers.py
import strawberry
from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from schemas.payment import PaymentProviderResponse
from services.payment_provider_service import (
    create_payment_provider,
    get_payment_providers,
    update_payment_provider,
    delete_payment_provider
)

@strawberry.type
class PaymentProvider:
    id: int
    name: str
    active: bool

    @classmethod
    def from_db(cls, provider):
        return cls(
            id=provider.id,
            name=provider.name,
            active=provider.active
        )

@strawberry.input
class PaymentProviderInput:
    name: str
    active: bool = True

@strawberry.type
class PaymentProviderQueries:
    @strawberry.field
    async def payment_providers(self, info) -> List[PaymentProvider]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can view payment providers")
        
        providers = get_payment_providers(info.context["db"])
        return [PaymentProvider.from_db(p) for p in providers]

@strawberry.type
class PaymentProviderMutations:
    @strawberry.mutation
    async def create_payment_provider(
        self,
        info,
        input: PaymentProviderInput
    ) -> PaymentProvider:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can create payment providers")
        
        provider = create_payment_provider(info.context["db"], input)
        return PaymentProvider.from_db(provider)

    @strawberry.mutation
    async def update_payment_provider(
        self,
        info,
        provider_id: int,
        input: PaymentProviderInput
    ) -> PaymentProvider:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can update payment providers")
        
        provider = update_payment_provider(
            info.context["db"],
            provider_id,
            input
        )
        return PaymentProvider.from_db(provider)

    @strawberry.mutation
    async def delete_payment_provider(
        self,
        info,
        provider_id: int
    ) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.rol != "admin":
            raise Exception("Only admins can delete payment providers")
        
        delete_payment_provider(info.context["db"], provider_id)
        return True