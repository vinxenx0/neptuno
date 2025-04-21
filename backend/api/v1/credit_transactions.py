# backend/api/v1/credit_transactions.py
# Endpoints para logs de transacciones de crédito (v1)
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from models.user import User, subscriptionEnum
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
    

@router.get("/kpis")
def get_saas_kpis(user=Depends(get_user_context), db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")

    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    last_7_days = now - timedelta(days=7)
    last_60_days = now - timedelta(days=60)
    current_month = now.month
    current_year = now.year

    # Usuarios
    total_users = db.query(User).count()
    active_users_30d = db.query(User).filter(User.last_login >= last_30_days).count()
    new_users_month = db.query(User).filter(
        func.extract('month', User.create_at) == current_month,
        func.extract('year', User.create_at) == current_year
    ).count()
    paying_users = db.query(User).filter(User.subscription != subscriptionEnum.FREEMIUM).count()

    # Ingresos
    payment_tx = db.query(CreditTransaction).filter(
        CreditTransaction.payment_status == "success",
        CreditTransaction.transaction_type == "payment",
        CreditTransaction.user_type == "registered"
    )
    monthly_payments = payment_tx.filter(
        func.extract('month', CreditTransaction.timestamp) == current_month,
        func.extract('year', CreditTransaction.timestamp) == current_year
    ).all()
    mrr = sum(tx.payment_amount for tx in monthly_payments if tx.payment_amount) or 0
    arr = mrr * 12
    total_revenue = sum(tx.payment_amount for tx in payment_tx.all() if tx.payment_amount) or 0

    # ARPU y LTV
    arpu = mrr / paying_users if paying_users else 0
    churned_users = db.query(User).filter(
        User.subscription.in_([subscriptionEnum.PREMIUM, subscriptionEnum.CORPORATE]),
        User.last_login < last_60_days
    ).count()
    churn_rate = churned_users / paying_users if paying_users else 0
    ltv = arpu / churn_rate if churn_rate else 0

    # Conversión
    conversions = db.query(User).filter(
        User.subscription.in_([subscriptionEnum.PREMIUM, subscriptionEnum.CORPORATE]),
        func.extract('month', User.create_at) == current_month
    ).count()
    conversion_rate = conversions / total_users if total_users else 0

    # Créditos
    total_credits = db.query(func.sum(User.credits)).scalar() or 0
    credits_used = db.query(CreditTransaction).filter(
        CreditTransaction.transaction_type == "usage"
    ).count()

    # DAU/WAU/MAU
    dau = db.query(User).filter(User.last_login >= now - timedelta(days=1)).count()
    wau = db.query(User).filter(User.last_login >= last_7_days).count()
    mau = active_users_30d

    return {
        "total_users": total_users,
        "active_users_30d": active_users_30d,
        "new_users_month": new_users_month,
        "paying_users": paying_users,
        "mrr": round(mrr, 2),
        "arr": round(arr, 2),
        "total_revenue": round(total_revenue, 2),
        "arpu": round(arpu, 2),
        "ltv": round(ltv, 2),
        "churn_rate": round(churn_rate, 4),
        "churned_users": churned_users,
        "conversion_rate": round(conversion_rate, 4),
        "total_credits": total_credits,
        "credits_used": credits_used,
        "dau": dau,
        "wau": wau,
        "mau": mau
    }
