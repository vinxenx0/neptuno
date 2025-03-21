from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from services.payment_service import add_payment_method, get_payment_methods, set_default_payment_method
from core.database import get_db
from core.logging import configure_logging

router = APIRouter(prefix="/v1/payments", tags=["payments"])
logger = configure_logging()

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