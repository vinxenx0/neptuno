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
    """
    Purchase credits for the user.

    Args:
        request (PurchaseRequest): The purchase request containing the number of credits, payment amount, and payment method.
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        PurchaseResponse: The response containing the details of the purchase.

    Raises:
        HTTPException: If the user is not registered.
    """
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
    """
    Add a new payment method for the user.

    Args:
        method (PaymentMethodCreate): The payment method details to be added.
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        PaymentMethodResponse: The response containing the details of the added payment method.

    Raises:
        HTTPException: If the user is not registered.
    """
    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden añadir métodos de pago")
    return add_payment_method(db, int(user.user_id), method.payment_type,
                              method.details, method.is_default)


@router.get("/methods", response_model=list[PaymentMethodResponse])
def list_methods(user: UserContext = Depends(get_user_context),
                 db: Session = Depends(get_db)):
    """
    Retrieve the list of payment methods for the user.

    Args:
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        list[PaymentMethodResponse]: A list of the user's payment methods.

    Raises:
        HTTPException: If the user is not registered.
    """
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
    """
    Set a payment method as the default for the user.

    Args:
        method_id (int): The ID of the payment method to set as default.
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        PaymentMethodResponse: The response containing the updated payment method details.

    Raises:
        HTTPException: If the user is not registered.
    """
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
    """
    Retrieve the list of credit transactions for the user.

    Args:
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        list[CreditTransactionResponse]: A list of the user's credit transactions.

    Raises:
        HTTPException: If the user is not registered.
    """
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
    """
    Update an existing payment method for the user.

    Args:
        method_id (int): The ID of the payment method to update.
        method (PaymentMethodCreate): The updated payment method details.
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        PaymentMethodResponse: The response containing the updated payment method details.

    Raises:
        HTTPException: If the user is not registered.
    """
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
    """
    Delete a payment method for the user.

    Args:
        method_id (int): The ID of the payment method to delete.
        user (UserContext): The user context, automatically injected by FastAPI.
        db (Session): The database session, automatically injected by FastAPI.

    Returns:
        dict: A message indicating the payment method was deleted.

    Raises:
        HTTPException: If the user is not registered.
    """
    if user.user_type != "registered":
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios registrados pueden eliminar métodos de pago")
    delete_payment_method(db, int(user.user_id), method_id)
    return {"message": "Método de pago eliminado"}
