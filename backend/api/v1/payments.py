# backend/api/v1/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from services.payment_service import add_payment_method, delete_payment_method, get_credit_transactions, get_payment_methods, purchase_credits, set_default_payment_method, update_payment_method
from core.database import get_db
from core.logging import configure_logging
from schemas.payment import CreditTransactionResponse, PurchaseRequest, PaymentMethodCreate, PaymentMethodResponse, PurchaseResponse

router = APIRouter(tags=["payments"])
logger = configure_logging()


@router.post("/purchase", response_model=PurchaseResponse)
async def buy_credits(request: PurchaseRequest,
                      user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden comprar créditos")
    return purchase_credits(db, int(user.user_id), request.credits,
                            request.payment_amount, request.payment_method)


@router.post("/methods", response_model=PaymentMethodResponse)
def add_method(method: PaymentMethodCreate,
               user: UserContext = Depends(get_user_context),
               db: Session = Depends(get_db)):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden añadir métodos de pago")
    return add_payment_method(db, int(user.user_id), method.payment_type,
                              method.details, method.is_default)


@router.get("/methods", response_model=list[PaymentMethodResponse])
def list_methods(user: UserContext = Depends(get_user_context),
                 db: Session = Depends(get_db)):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden ver sus métodos de pago")
    return get_payment_methods(db, int(user.user_id))


@router.put("/methods/{method_id}/default",
            response_model=PaymentMethodResponse)
def set_default(method_id: int,
                user: UserContext = Depends(get_user_context),
                db: Session = Depends(get_db)):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail=
            "Solo usuarios registrados pueden establecer un método de pago por defecto"
        )
    return set_default_payment_method(db, int(user.user_id), method_id)


@router.get("/transactions", response_model=list[CreditTransactionResponse])
def list_transactions(user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden ver sus transacciones")
    return get_credit_transactions(db, int(user.user_id))


@router.put("/methods/{method_id}", response_model=PaymentMethodResponse)
def update_method(
        method_id: int,
        method: PaymentMethodCreate,
        user: UserContext = Depends(get_user_context),
        db: Session = Depends(get_db),
):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden actualizar métodos de pago"
        )
    return update_payment_method(db, int(user.user_id), method_id,
                                 method.payment_type, method.details)


@router.delete("/methods/{method_id}")
def delete_method(
        method_id: int,
        user: UserContext = Depends(get_user_context),
        db: Session = Depends(get_db),
):

    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden eliminar métodos de pago")
    delete_payment_method(db, int(user.user_id), method_id)
    return {"message": "Método de pago eliminado"}