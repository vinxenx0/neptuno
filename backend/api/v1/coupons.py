# backend/api/v1/coupons.py
import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from models.user import User
from services.settings_service import get_setting
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.coupon_service import create_coupon, create_test_coupon, delete_coupon, get_coupon_activity, get_user_coupons, get_all_coupons, redeem_coupon, update_coupon
from schemas.coupon import CouponTypeCreate, CouponTypeResponse, CouponCreate, CouponResponse
from schemas.coupon import CouponCreate, CouponResponse
from models.coupon_type import CouponType
from typing import List

router = APIRouter(tags=["Coupons"])

@router.post("/test", response_model=dict)
async def create_test_coupon_route(
    coupon_type_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_context)
):
    """
    Crea un cupón de prueba para un tipo de cupón específico. Solo para administradores.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado. Solo administradores pueden crear cupones de prueba."
        )
    return create_test_coupon(db, coupon_type_id, admin_user_id=current_user.id)

@router.get("/activity", response_model=dict)
async def get_coupons_activity(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_context)
):
    """
    Obtiene la actividad de cupones con paginación. Solo accesible para administradores.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado. Solo administradores pueden ver la actividad de cupones."
        )
    return get_coupon_activity(db, page, limit)



@router.post("/types", response_model=CouponTypeResponse)
def create_coupon_type(coupon_type_data: CouponTypeCreate,
                       user: UserContext = Depends(get_user_context),
                       db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden crear tipos de cupones")
    coupon_type = CouponType(**coupon_type_data.dict())
    db.add(coupon_type)
    db.commit()
    db.refresh(coupon_type)
    return coupon_type


@router.get("/types", response_model=List[CouponTypeResponse])
def get_coupon_types(user: UserContext = Depends(get_user_context),
                     db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden ver tipos de cupones")
    return db.query(CouponType).all()


@router.post("/", response_model=CouponResponse)
def create_coupon_endpoint(coupon_data: CouponCreate,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden crear cupones manualmente")
    return create_coupon(db, coupon_data)


@router.get("/me", response_model=List[CouponResponse])
def get_my_coupons(user: UserContext = Depends(get_user_context),
                   db: Session = Depends(get_db)):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(
            status_code=403,
            detail="La funcionalidad de cupones está deshabilitada")
    user_id = user.user_id if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None
    return get_user_coupons(db, user_id, session_id)


@router.get("/", response_model=List[CouponResponse])
def get_all_coupons_endpoint(user: UserContext = Depends(get_user_context),
                             db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden ver todos los cupones")
    return get_all_coupons(db)


@router.post("/redeem/{coupon_id}", response_model=CouponResponse)
def redeem_coupon_endpoint(coupon_id: int,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(
            status_code=403,
            detail="La funcionalidad de cupones está deshabilitada")
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None
    return redeem_coupon(db, coupon_id, user_id, session_id)


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon_endpoint(coupon_id: int,
                           coupon_update: CouponCreate,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden actualizar cupones")
    return update_coupon(db, coupon_id, coupon_update)


@router.delete("/{coupon_id}")
def delete_coupon_endpoint(coupon_id: int,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden eliminar cupones")
    return delete_coupon(db, coupon_id)


@router.post("/redeem/{coupon_id}", response_model=CouponResponse)
def redeem_coupon_endpoint(coupon_id: int,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(
            status_code=403,
            detail="La funcionalidad de cupones está deshabilitada")
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None
    return redeem_coupon(db, coupon_id, user_id, session_id)


@router.post("/generate-demo-coupon", response_model=CouponResponse)
def generate_demo_coupon(user: UserContext = Depends(get_user_context),
                         db: Session = Depends(get_db)):
    coupon_type = db.query(CouponType).filter(
        CouponType.name == "Demostración").first()
    if not coupon_type:
        raise HTTPException(
            status_code=500,
            detail="Tipo de cupón 'Demostración' no encontrado")

    coupon_data = CouponCreate(
        name="Demo Coupon",
        description="Cupón de demostración",
        credits=5,
        active=True,
        unique_identifier=f"DEMO-{uuid.uuid4()}",
        coupon_type_id=coupon_type.id  # Añadir el coupon_type_id
    )
    coupon = create_coupon(
        db,
        coupon_data,
        user_id=user.user_id if user.user_type == "registered" else None)
    return coupon
