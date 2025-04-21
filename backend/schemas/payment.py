# backend/schemas/payment.py
# Esquemas Pydantic para pagos y métodos de pago

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PurchaseRequest(BaseModel):
    credits: int
    payment_amount: float
    payment_method: Optional[str] = "stripe"

class PurchaseResponse(BaseModel):
    transaction_id: int
    credits_added: int
    new_balance: int

class PaymentMethodCreate(BaseModel):
    payment_type: str
    details: str
    is_default: bool = False

class PaymentMethodResponse(BaseModel):
    id: int
    payment_type: str
    details: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permite mapear desde objetos SQLAlchemy
        
class CreditTransactionResponse(BaseModel):
    id: int
    amount: int
    transaction_type: str
    payment_amount: Optional[float] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True  # Permite mapear desde objetos SQLAlchemy
        
class PaymentProviderBase(BaseModel):
    name: str
    active: bool = True

class PaymentProviderCreate(PaymentProviderBase):
    pass

class PaymentProviderResponse(PaymentProviderBase):
    id: int

    class Config:
        from_attributes = True