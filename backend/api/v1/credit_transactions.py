# backend/api/v1/credit_transactions.py
# backend/api/v1/credit_transactions.py
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
    """
    Retrieve a paginated list of credit transactions.

    Args:
        page (int): The page number to retrieve. Defaults to 1. Must be greater than or equal to 1.
        limit (int): The number of items per page. Defaults to 10. Must be between 1 and 100.
        user: The user context, injected via dependency. Used to check if the user has admin privileges.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing the following keys:
            - data (List[CreditTransactionResponse]): A list of serialized credit transactions.
            - total_items (int): The total number of credit transactions.
            - total_pages (int): The total number of pages based on the limit.
            - current_page (int): The current page number.

    Raises:
        HTTPException: If the user does not have admin privileges (403).
    """
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
