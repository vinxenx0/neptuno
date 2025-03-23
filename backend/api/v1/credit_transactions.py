from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.credit_transaction import CreditTransaction
from schemas.credit_transaction import CreditTransactionResponse
from dependencies.auth import get_user_context
from core.database import get_db

router = APIRouter(tags=["Transactions"])

@router.get("/", response_model=List[CreditTransactionResponse])
def get_credit_transactions(
    user=Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden acceder a este recurso")
    transactions = db.query(CreditTransaction).all()
    return transactions