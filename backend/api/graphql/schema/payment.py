# backend/api/v1/graphql/schema/payments.py
import strawberry
from typing import List, Optional
from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from schemas.payment import (
    PurchaseRequest,
    PurchaseResponse,
    PaymentMethodCreate,
    PaymentMethodResponse,
    CreditTransactionResponse
)
from services.payment_service import (
    purchase_credits,
    add_payment_method,
    get_payment_methods,
    set_default_payment_method,
    get_credit_transactions,
    update_payment_method,
    delete_payment_method
)

@strawberry.type
class PurchaseResult:
    transaction_id: int
    credits_added: int
    new_balance: int

@strawberry.type
class PaymentMethod:
    id: int
    payment_type: str
    details: str
    is_default: bool
    created_at: str
    updated_at: str

    @classmethod
    def from_db(cls, method):
        return cls(
            id=method.id,
            payment_type=method.payment_type,
            details=method.details,
            is_default=method.is_default,
            created_at=method.created_at.isoformat(),
            updated_at=method.updated_at.isoformat()
        )

@strawberry.type
class CreditTransaction:
    id: int
    amount: int
    transaction_type: str
    payment_amount: Optional[float]
    payment_method: Optional[str]
    payment_status: Optional[str]
    timestamp: str

    @classmethod
    def from_db(cls, transaction):
        return cls(
            id=transaction.id,
            amount=transaction.amount,
            transaction_type=transaction.transaction_type,
            payment_amount=transaction.payment_amount,
            payment_method=transaction.payment_method,
            payment_status=transaction.payment_status,
            timestamp=transaction.timestamp.isoformat()
        )

@strawberry.input
class PurchaseInput:
    credits: int
    payment_amount: float
    payment_method: Optional[str] = "stripe"

@strawberry.input
class PaymentMethodInput:
    payment_type: str
    details: str
    is_default: bool = False

@strawberry.type
class PaymentQueries:
    @strawberry.field
    async def my_payment_methods(self, info) -> List[PaymentMethod]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can view payment methods")
        
        methods = get_payment_methods(info.context["db"], int(user.user_id))
        return [PaymentMethod.from_db(m) for m in methods]

    @strawberry.field
    async def my_transactions(self, info) -> List[CreditTransaction]:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can view transactions")
        
        transactions = get_credit_transactions(info.context["db"], int(user.user_id))
        return [CreditTransaction.from_db(t) for t in transactions]

@strawberry.type
class PaymentMutations:
    @strawberry.mutation
    async def purchase_credits(
        self,
        info,
        input: PurchaseInput
    ) -> PurchaseResult:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can purchase credits")
        
        result = purchase_credits(
            info.context["db"],
            int(user.user_id),
            input.credits,
            input.payment_amount,
            input.payment_method
        )
        return PurchaseResult(
            transaction_id=result["transaction_id"],
            credits_added=result["credits_added"],
            new_balance=result["new_balance"]
        )

    @strawberry.mutation
    async def add_payment_method(
        self,
        info,
        input: PaymentMethodInput
    ) -> PaymentMethod:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can add payment methods")
        
        method = add_payment_method(
            info.context["db"],
            int(user.user_id),
            input.payment_type,
            input.details,
            input.is_default
        )
        return PaymentMethod.from_db(method)

    @strawberry.mutation
    async def set_default_payment_method(
        self,
        info,
        method_id: int
    ) -> PaymentMethod:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can set default payment methods")
        
        method = set_default_payment_method(
            info.context["db"],
            int(user.user_id),
            method_id
        )
        return PaymentMethod.from_db(method)

    @strawberry.mutation
    async def update_payment_method(
        self,
        info,
        method_id: int,
        input: PaymentMethodInput
    ) -> PaymentMethod:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can update payment methods")
        
        method = update_payment_method(
            info.context["db"],
            int(user.user_id),
            method_id,
            input.payment_type,
            input.details
        )
        return PaymentMethod.from_db(method)

    @strawberry.mutation
    async def delete_payment_method(
        self,
        info,
        method_id: int
    ) -> bool:
        user = await get_user_context(info.context["request"], info.context["db"])
        if user.user_type != "registered":
            raise Exception("Only registered users can delete payment methods")
        
        delete_payment_method(
            info.context["db"],
            int(user.user_id),
            method_id
        )
        return True