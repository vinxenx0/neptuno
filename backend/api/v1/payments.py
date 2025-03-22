# backend/api/v1/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from services.payment_service import add_payment_method, get_payment_methods, purchase_credits, set_default_payment_method
from core.database import get_db
from core.logging import configure_logging
from pydantic import BaseModel

router = APIRouter(tags=["payments"])
logger = configure_logging()

class PurchaseRequest(BaseModel):
    credits: int
    payment_amount: float  # En USD, por ejemplo
    payment_method: str = "stripe"

@router.post("/purchase")
async def buy_credits(
    request: PurchaseRequest,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    return purchase_credits(db, int(user.user_id), request.credits, request.payment_amount, request.payment_method)

@router.post("/methods")
def add_method(
    payment_type: str,
    details: str,
    is_default: bool = False,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return add_payment_method(db, int(user.user_id), payment_type, details, is_default)

@router.get("/methods")
def list_methods(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    methods = get_payment_methods(db, int(user.user_id))
    return [{"id": m.id, "type": m.payment_type, "details": m.details, "is_default": m.is_default} for m in methods]

@router.put("/methods/{method_id}/default")
def set_default(
    method_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados")
    return set_default_payment_method(db, int(user.user_id), method_id)