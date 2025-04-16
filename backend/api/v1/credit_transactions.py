# backend/api/v1/credit_transactions.py
# Endpoints para logs de transacciones de crédito (v1)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from models.credit_transaction import CreditTransaction
from schemas.credit_transaction import CreditTransactionResponse
from dependencies.auth import get_user_context
from core.database import get_db
from math import ceil

router = APIRouter(tags=["Transactions"])


@router.get("/", response_model=dict)
def get_credit_transactions(page: int = Query(1, ge=1),
                            limit: int = Query(10, ge=1, le=100),
                            user=Depends(get_user_context),
                            db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo los administradores pueden acceder a este recurso")

    offset = (page - 1) * limit
    query = db.query(CreditTransaction)
    total_items = query.count()
    transactions = query.offset(offset).limit(limit).all()

    # Convertir los modelos SQLAlchemy a esquemas Pydantic
    transactions_data = [
        CreditTransactionResponse.from_orm(t) for t in transactions
    ]

    return {
        "data": transactions_data,  # Usar los datos serializados
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }
