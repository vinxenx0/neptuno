from pydantic import BaseModel
from datetime import datetime

class CreditTransactionBase(BaseModel):
    user_id: int | None
    session_id: str | None
    amount: int
    transaction_type: str
    payment_amount: float | None
    payment_method: str | None
    payment_status: str
    timestamp: datetime

class CreditTransactionResponse(CreditTransactionBase):
    id: int

    class Config:
        orm_mode = True