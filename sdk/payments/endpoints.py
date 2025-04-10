from typing import List
from client import request
from models.payment import (
    PurchaseRequest,
    PurchaseResponse,
    PaymentMethodCreate,
    PaymentMethodResponse,
    CreditTransactionResponse,
)


def buy_credits(data: PurchaseRequest) -> PurchaseResponse:
    result = request("POST", "/v1/payments/purchase", data=data.dict())
    return PurchaseResponse(**result)


def add_payment_method(data: PaymentMethodCreate) -> PaymentMethodResponse:
    result = request("POST", "/v1/payments/methods", data=data.dict())
    return PaymentMethodResponse(**result)


def list_payment_methods() -> List[PaymentMethodResponse]:
    result = request("GET", "/v1/payments/methods")
    return [PaymentMethodResponse(**m) for m in result]


def set_default_method(method_id: int) -> PaymentMethodResponse:
    result = request("PUT", f"/v1/payments/methods/{method_id}/default")
    return PaymentMethodResponse(**result)


def list_credit_transactions() -> List[CreditTransactionResponse]:
    result = request("GET", "/v1/payments/transactions")
    return [CreditTransactionResponse(**t) for t in result]


def update_payment_method(method_id: int, data: PaymentMethodCreate) -> PaymentMethodResponse:
    result = request("PUT", f"/v1/payments/methods/{method_id}", data=data.dict())
    return PaymentMethodResponse(**result)


def delete_payment_method(method_id: int) -> dict:
    return request("DELETE", f"/v1/payments/methods/{method_id}")
