Exacto, quiero que amplies el numero de dashboard que tenemos añadiendo un dashboard independiente para gamificación y otro para monitorizar los KPI claves de cualquier negocio SaaS (ARR,MRR, churn rate, etc)

Los dashboard seran independientes de los demas y seran nuevas opciones en el menu de admin (engranaje en navbar)

Los nuevos dashboard se llamarán: RENUEVES y GAMIFICATION

Para ambos dashboard busca los KPI mas interesantes, y recuerda que deben dar una visión global de las estadisticas de juego de todos los usuarios y las estadisticas financieras de Neptuno.

Aqui te paso los endpoints y archivos que puedes necesitar

# backend/api/v1/coupons.py
# Endpoints para gestión y canje de cupones (v1)
from datetime import datetime
import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from core.logging import configure_logging
from models.coupon_type import CouponType
from models.user import User
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.coupon_service import (create_coupon, create_test_coupon, get_coupon_activity,
                                     get_user_coupons, get_all_coupons,
                                     update_coupon, delete_coupon,
                                     redeem_coupon)
from schemas.coupon import CouponCreate, CouponResponse, CouponTypeCreate, CouponTypeResponse, CouponUpdate
from services.settings_service import get_setting
from typing import List

router = APIRouter(tags=["Coupons"])

logger = configure_logging()

@router.post("/test", response_model=CouponResponse)
async def create_test_coupon_route(
    coupon_type_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_user_context)
):
    try:
        # Llamar al servicio para crear el cupón
        new_coupon = create_test_coupon(db, coupon_type_id, int(current_user.user_id))
        db.commit()
        db.refresh(new_coupon)

        # Devolver el cupón creado como respuesta
        return CouponResponse.from_orm(new_coupon)
    except Exception as e:
        logger.error(f"Error al crear cupón de prueba: {e}")
        raise HTTPException(status_code=500, detail="Error al crear cupón de prueba")

@router.get("/activity", response_model=dict)
async def get_coupons_activity(
        page: int = Query(1, ge=1, description="Número de página"),
        limit: int = Query(10,
                           ge=1,
                           le=100,
                           description="Elementos por página"),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_user_context)):
    """
    Obtiene la actividad de cupones con paginación. Solo accesible para administradores.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=
            "No autorizado. Solo administradores pueden ver la actividad de cupones."
        )
    return get_coupon_activity(db, page, limit)


@router.post("/", response_model=CouponResponse)
def create_coupon_endpoint(coupon_data: CouponCreate,
                           user: UserContext = Depends(get_user_context),
                           db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403,
                            detail="Solo administradores pueden crear cupones")
    return create_coupon(db, coupon_data)


@router.get("/me", response_model=List[CouponResponse])
def get_my_coupons(user: UserContext = Depends(get_user_context),
                   db: Session = Depends(get_db)):
    enable_coupons = get_setting(db, "enable_coupons")
    if enable_coupons != "true":
        raise HTTPException(
            status_code=403,
            detail="La funcionalidad de cupones está deshabilitada")
    user_id = int(user.user_id) if user.user_type == "registered" else None
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


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon_endpoint(coupon_id: int,
                           coupon_update: CouponUpdate,
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
def generate_demo_coupon(credits: int,
                         db: Session = Depends(get_db),
                         current_user: UserContext = Depends(get_user_context)):

    # Determinar user_id y session_id según el tipo de usuario
    user_id = current_user.user_id if current_user.user_type == "registered" else None
    session_id = current_user.session_id if current_user.user_type == "anonymous" else None

    coupon_data = CouponCreate(
        name="Demo Coupon",
        description="Cupón de demostración",
        credits=credits,
        active=True,
        unique_identifier=str(uuid.uuid4()),
        session_id=session_id,
        user_id=user_id,
        expires_at=None,
        issued_at=datetime.utcnow(),
        redeemed_at=None,
        status="active",
        coupon_type_id=1,  # Asignar un tipo de cupón por defecto
    )

    coupon = create_coupon(db, coupon_data, user_id=user_id, session_id=session_id)
    return coupon


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

# backend/api/v1/gamification.py
# Endpoints para gamificación: eventos, puntos, badges, rankings
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.gamification_service import (
    create_event_type, get_badges_for_event, get_event_details,
    get_event_types, get_rankings, get_user_events, get_user_gamification,
    get_user_progress_for_event, register_event, update_event_type,
    delete_event_type, create_badge, get_badges, update_badge, delete_badge)
from schemas.gamification import (EventTypeCreate, EventTypeResponse,
                                  BadgeCreate, BadgeResponse,
                                  GamificationEventCreate,
                                  GamificationEventResponse,
                                  UserGamificationResponse, RankingResponse)
from typing import List

router = APIRouter(tags=["Gamification"])


# Endpoints existentes
@router.get("/rankings", response_model=List[RankingResponse])
def get_rankings_endpoint(db: Session = Depends(get_db)):
    return get_rankings(db)


@router.post("/events")
async def create_event(event: GamificationEventCreate,
                       user: UserContext = Depends(get_user_context),
                       db: Session = Depends(get_db)):
    return register_event(db, event, user)


@router.get("/me", response_model=List[UserGamificationResponse])
def get_my_gamification(user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    return get_user_gamification(db, user)


@router.get("/events", response_model=List[GamificationEventResponse])
def get_my_events(user: UserContext = Depends(get_user_context),
                  db: Session = Depends(get_db)):
    return get_user_events(db, user)


@router.get("/events/{event_id}", response_model=GamificationEventResponse)
def get_event_details_endpoint(event_id: int,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    event = get_event_details(db, event_id, user)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/progress/{event_type_id}",
            response_model=UserGamificationResponse)
def get_user_progress_for_event_endpoint(
    event_type_id: int,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)):
    progress = get_user_progress_for_event(db, user, event_type_id)
    if not progress:
        raise HTTPException(status_code=404,
                            detail="Progress not found for this event")
    return progress


@router.get("/event-types/{event_type_id}/badges",
            response_model=List[BadgeResponse])
def get_badges_for_event_endpoint(event_type_id: int,
                                  db: Session = Depends(get_db)):
    badges = get_badges_for_event(db, event_type_id)
    if not badges:
        raise HTTPException(status_code=404,
                            detail="No badges found for this event type")
    return badges


@router.post("/event-types", response_model=EventTypeResponse)
def create_event_type_endpoint(event_type: EventTypeCreate,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_event_type(db, event_type)


@router.get("/event-types", response_model=List[EventTypeResponse])
def get_event_types_endpoint(user: UserContext = Depends(get_user_context),
                             db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_event_types(db)


@router.put("/event-types/{event_type_id}", response_model=EventTypeResponse)
def update_event_type_endpoint(event_type_id: int,
                               event_type_update: EventTypeCreate,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_event_type(db, event_type_id, event_type_update)


@router.delete("/event-types/{event_type_id}")
def delete_event_type_endpoint(event_type_id: int,
                               user: UserContext = Depends(get_user_context),
                               db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_event_type(db, event_type_id)
    return {"message": "Tipo de evento eliminado"}


@router.post("/badges", response_model=BadgeResponse)
def create_badge_endpoint(badge: BadgeCreate,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return create_badge(db, badge)


@router.get("/badges", response_model=List[BadgeResponse])
def get_badges_endpoint(user: UserContext = Depends(get_user_context),
                        db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return get_badges(db)


@router.put("/badges/{badge_id}", response_model=BadgeResponse)
def update_badge_endpoint(badge_id: int,
                          badge_update: BadgeCreate,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return update_badge(db, badge_id, badge_update)


@router.delete("/badges/{badge_id}")
def delete_badge_endpoint(badge_id: int,
                          user: UserContext = Depends(get_user_context),
                          db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    delete_badge(db, badge_id)
    return {"message": "Badge eliminado"}


# backend/api/v1/payments.py
# Endpoints para pagos y métodos de pago (v1)
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

# backend/api/v1/users.py
# Endpoints de gestión de usuarios (v1)
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserResponse, UpdateProfileRequest
from services.user_service import get_user_info, update_user, delete_user, list_users
from core.database import get_db
from dependencies.auth import UserContext, get_user_context
from core.logging import configure_logging

router = APIRouter(tags=["users"])

logger = configure_logging()

@router.get("/me", response_model=UserResponse)
def get_me(user: UserContext = Depends(get_user_context),
           db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return get_user_info(db, int(user.user_id))


@router.put("/me", response_model=UserResponse)
def update_me(request: UpdateProfileRequest,
              user: UserContext = Depends(get_user_context),
              db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return update_user(db, int(user.user_id), request.email, request.username,
                       request.ciudad, request.website)


@router.delete("/me", response_model=dict)
def delete_me(user: UserContext = Depends(get_user_context),
              db: Session = Depends(get_db)):
    if user.user_type != "registered":
        raise HTTPException(status_code=403,
                            detail="Solo usuarios registrados")
    return delete_user(db, int(user.user_id))


@router.get("/admin/users", response_model=dict)
def get_all_users(page: int = Query(1, ge=1),
                  limit: int = Query(10, ge=1, le=100),
                  user=Depends(get_user_context),
                  db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden ver la lista de usuarios")

    offset = (page - 1) * limit
    query = db.query(User)
    total_items = query.count()
    users = query.offset(offset).limit(limit).all()

    # Convertimos los usuarios a esquemas Pydantic
    users_data = [UserResponse.model_validate(user) for user in users]

    return {
        "data": users_data,
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int,
             user: UserContext = Depends(get_user_context),
             db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden acceder a esta información")
    user_data = get_user_info(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_data


@router.put("/{user_id}", response_model=UserResponse)
def update_user_by_id(user_id: int,
                      request: UpdateProfileRequest,
                      user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden actualizar usuarios")
    updated_user = update_user(db,
                               user_id,
                               email=request.email,
                               username=request.username,
                               ciudad=request.ciudad,
                               website=request.website)
    return updated_user


@router.delete("/{user_id}", response_model=dict)
def delete_user_by_id(user_id: int,
                      user: UserContext = Depends(get_user_context),
                      db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo administradores pueden eliminar usuarios")
    result = delete_user(db, user_id)
    return result

# backend/middleware/gamification.py
# Middleware para registrar eventos de gamificación
from fastapi import Depends
from functools import wraps
from sqlalchemy.orm import Session
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from services.gamification_service import register_event
from schemas.gamification import GamificationEventCreate
from models.gamification import EventType


def track_gamification_event(event_type_name: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
            event_type = db.query(EventType).filter(EventType.name == event_type_name).first()
            if not event_type:
                raise ValueError(f"Event type '{event_type_name}' not found")

            event = GamificationEventCreate(event_type_id=event_type.id)
            register_event(db, event, user)

            return await func(user=user, db=db, *args, **kwargs)
        return wrapper
    return decorator

# backend/middleware/credits_middleware.py
# Middleware para controlar y descontar créditos en endpoints

from schemas.gamification import GamificationEventCreate
from services.gamification_service import register_event
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
from models.guests import GuestsSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting
from dependencies.auth import UserContext

logger = configure_logging()

# backend/middleware/credits.py
from fastapi import Depends, HTTPException
from functools import wraps
from sqlalchemy.orm import Session
from models.credit_transaction import CreditTransaction
from dependencies.auth import UserContext, get_user_context
from models.user import User
from models.guests import GuestsSession
from core.database import get_db
from core.logging import configure_logging
from services.integration_service import trigger_webhook
from services.settings_service import get_setting

logger = configure_logging()

def require_credits(func):
    @wraps(func)
    async def wrapper(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db), *args, **kwargs):
        disable_credits = get_setting(db, "disable_credits")
        
        if disable_credits != "true":  # Solo procesar créditos si no están desactivados
            try:
                if user.user_type == "registered":
                    user_db = db.query(User).filter(User.id == int(user.user_id)).first()
                    if not user_db:
                        raise HTTPException(status_code=404, detail="Usuario no encontrado")
                    credits = user_db.credits
                else:
                    session_db = db.query(GuestsSession).filter(GuestsSession.id == user.session_id).first()
                    if not session_db:
                        raise HTTPException(status_code=404, detail="Sesión no encontrada")
                    credits = session_db.credits

                if credits <= 0:
                    logger.warning(f"Usuario {user.user_type} ID {user.user_id} sin créditos suficientes")
                    raise HTTPException(status_code=403, detail="No te quedan créditos disponibles.")

                logger.info(f"Usuario {user.user_type} ID {user.user_id} realiza consulta")
                response = await func(user=user, db=db, *args, **kwargs)

                if user.user_type == "registered":
                    user_db.credits -= 1
                    transaction = CreditTransaction(
                        user_id=user_db.id,
                        user_type="registered",
                        amount=-1,
                        transaction_type="usage",
                        description="Consulta realizada"
                    )
                else:
                    session_db.credits -= 1
                    transaction = CreditTransaction(
                        session_id=session_db.id,
                        user_type="anonymous",
                        amount=-1,
                        transaction_type="usage",
                        description="Consulta realizada por anónimo"
                    )

                # Verificación adicional de user_type
                if transaction.user_type != user.user_type:
                    logger.error(f"Inconsistencia en user_type: transacción={transaction.user_type}, contexto={user.user_type}")
                    raise HTTPException(status_code=500, detail="Inconsistencia en el tipo de usuario")

                # Registro de parámetros de la transacción para depuración
                logger.debug(f"Parámetros de la transacción: {transaction.__dict__}")

                db.add(transaction)
                db.commit()

                trigger_webhook(db, "credit_usage", {
                    "user_id": user.user_id,
                    "user_type": user.user_type,
                    "credits_remaining": credits - 1
                })

                logger.debug(f"Créditos actualizados para {user.user_type} ID {user.user_id}: {credits - 1}")
                
                # Registrar evento de gamificación
                #event = GamificationEventCreate(event_type="api_usage")
                #register_event(db, event, user)
                
                return response
            except HTTPException as e:
                raise e
            except Exception as e:
                logger.error(f"Error inesperado en middleware de créditos para {user.user_type} ID {user.user_id}: {str(e)}")
                raise HTTPException(status_code=500, detail="Error al procesar los créditos")
        else:
            return await func(user=user, db=db, *args, **kwargs)
    return wrapper

# backend/models/coupon_type.py
# Modelo de tipos de cupones para la base de datos
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from core.database import Base
from datetime import datetime

class CouponType(Base):
    __tablename__ = "coupon_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ejemplo: "Bienvenida", "Demostración"
    
    description = Column(String(255), nullable=True)
    credits = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# backend/models/coupon.py
# Modelo de cupones y sus relaciones en la base de datos

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from models.guests import GuestsSession
from models.user import User
from core.database import Base
from datetime import datetime

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    coupon_type_id = Column(Integer, ForeignKey("coupon_types.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    unique_identifier = Column(String(50), unique=True, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    redeemed_at = Column(DateTime, nullable=True)
    active = Column(Boolean, default=True)
    status = Column(String(20), default="active")  # "active", "redeemed", "expired", "disabled"
    credits = Column(Integer, nullable=False)

    # Relaciones con usuario registrado o sesión anónima
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)

    # Quién canjeó el cupón
    redeemed_by_user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    redeemed_by_session_id = Column(String, ForeignKey("sesiones_anonimas.id"), nullable=True)

    # Relaciones ORM
    user = relationship("User", foreign_keys=[user_id], back_populates="coupons")
    session = relationship("GuestsSession", foreign_keys=[session_id], back_populates="coupons")
    redeemed_by_user = relationship("User", foreign_keys=[redeemed_by_user_id])
    redeemed_by_session = relationship("GuestsSession", foreign_keys=[redeemed_by_session_id])

# backend/models/credit_transaction.py
# Modelo de transacciones de crédito en la base de datos
from sqlalchemy import CheckConstraint, Column, Integer, String, ForeignKey, DateTime, Float
from models.user import Base
from datetime import datetime


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36),
                        ForeignKey("sesiones_anonimas.id"),
                        nullable=True)
    user_type = Column(String(20), nullable=False) #, default="anonymous") # "registered" o "anonymous"
    amount = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    payment_amount = Column(Float, nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_status = Column(String(20), default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Restricción para asegurar que solo uno de user_id o session_id esté presente
    __table_args__ = (CheckConstraint(
        "(user_id IS NOT NULL AND session_id IS NULL AND user_type = 'registered') OR "
        "(user_id IS NULL AND session_id IS NOT NULL AND user_type = 'anonymous')",
        name="check_user_or_session"), )

# backend/models/gamification.py
# Modelo de gamificación: eventos, badges, puntos, ranking

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
from models.user import User
from models.guests import GuestsSession


# backend/models/gamification.py
class EventType(Base):
    __tablename__ = "event_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ej: "api_usage"
    description = Column(String(255), nullable=True)
    points_per_event = Column(Integer, default=0)  # Puntos por ocurrencia del evento

    badges = relationship("Badge", back_populates="event_type")
    gamification_events = relationship("GamificationEvent", back_populates="event_type")
    user_gamification = relationship("UserGamification", back_populates="event_type")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # Ej: "Novato", "Becario"
    description = Column(String(255), nullable=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    required_points = Column(Integer, nullable=False)  # Puntos necesarios para el badge
    user_type = Column(String(20), default="both")  # "anonymous", "registered", "both"

    event_type = relationship("EventType", back_populates="badges")
    user_gamification = relationship("UserGamification", back_populates="badge")

class GamificationEvent(Base):
    __tablename__ = "gamification_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    event_type = relationship("EventType", back_populates="gamification_events")
    user = relationship("User", back_populates="gamification_events")
    session = relationship("GuestsSession", back_populates="gamification_events")

class UserGamification(Base):
    __tablename__ = "user_gamification"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    session_id = Column(String(36), ForeignKey("sesiones_anonimas.id"), nullable=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    points = Column(Integer, default=0)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=True)
    
    event_type = relationship("EventType", back_populates="user_gamification")
    badge = relationship("Badge", back_populates="user_gamification")
    user = relationship("User", back_populates="gamification")
    session = relationship("GuestsSession", back_populates="gamification")

# backend/models/payment_method.py
# Modelo de métodos de pago de usuario

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from models.user import Base
from datetime import datetime

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Vinculado a un usuario
    payment_type = Column(String(20), nullable=False)  # "credit_card", "paypal", "bank_transfer"
    details = Column(String(255), nullable=False)  # Datos encriptados (ej. últimos 4 dígitos, email PayPal)
    is_default = Column(Boolean, default=False)  # Método favorito
    created_at = Column(DateTime, default=datetime.utcnow)  # Fecha de creación
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Última actualización

# backend/models/user.py
# Modelo de usuario y sus atributos principales
from datetime import datetime
from sqlalchemy import Column, Float, Integer, String, DateTime, Boolean, Enum
from core.database import Base
from sqlalchemy.orm import relationship
import enum

class subscriptionEnum(enum.Enum):
    FREEMIUM = "freemium"
    PREMIUM = "premium"
    CORPORATE = "corporate"

class User(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable para terceros
    auth_provider = Column(String(20), nullable=True)  # "local", "google", "meta", etc.
    provider_id = Column(String(255), nullable=True)  # ID único del proveedor
    rol = Column(String(20), default="user")  # "user" o "admin"
    activo = Column(Boolean, default=True)  # Estado de la cuenta
    subscription = Column(Enum(subscriptionEnum), default=subscriptionEnum.FREEMIUM)  # subscription de suscripción
    #ciudad = Column(String(100), nullable=True)  # Para perfil
    website = Column(String(255), nullable=True)  # URL de avatar o perfil
    credits = Column(Integer, default=10)  # Créditos disponibles
    #create_at = Column(DateTime, default=datetime.utcnow)  # Fecha de registro
    renewal = Column(DateTime, nullable=True)  # Última renovación de créditos
    last_ip = Column(String(45), nullable=True)  # Última IP conocida (IPv4/IPv6)
    last_login = Column(DateTime, nullable=True)  # Último inicio de sesión
    token_valid_until = Column(DateTime, nullable=True)  # Fecha de expiración del token actual
    
    
    gamification_events = relationship("GamificationEvent", back_populates="user")
    gamification = relationship("UserGamification", back_populates="user")
    

    # Añadir relaciones inversas en los modelos existentes
    coupons = relationship("Coupon", foreign_keys="Coupon.user_id", back_populates="user")

    
      # 📌 Ubicación y demografía
    #pais = Column(String(100), nullable=True)  
    ciudad = Column(String(100), nullable=True)  
    #zona_horaria = Column(String(50), nullable=True)  
    #idioma = Column(String(20), nullable=True)  

    # 📌 Datos de empresa
    #empresa = Column(String(255), nullable=True)  
    #industria = Column(String(100), nullable=True)  
    #tamaño_empresa = Column(String(50), nullable=True)  # Startup, PYME, Enterprise
    #num_empleados = Column(Integer, nullable=True)  
    #ingresos_anuales = Column(Float, nullable=True)  
    #presupuesto_estimado = Column(Float, nullable=True)  

    # 📌 Datos técnicos y uso
    #tecnologias_usadas = Column(String(255), nullable=True)  
    #nivel_digitalizacion = Column(String(50), nullable=True)  
    #dispositivo_frecuente = Column(String(50), nullable=True)  
    #engagement = Column(Float, nullable=True)  # % de funciones utilizadas  
    #tiempo_en_plataforma = Column(Integer, nullable=True)  # Minutos activos por mes  

    # 📌 Ciclo de vida
    create_at = Column(DateTime, default=datetime.utcnow)  
    #ultima_actividad = Column(DateTime, nullable=True)  
    #historial_pagos = Column(String(255), nullable=True)  
    #probabilidad_churn = Column(Float, nullable=True)  

    # 📌 Datos comerciales
    #volumen_transacciones = Column(Float, nullable=True)  
    #origen_lead = Column(String(100), nullable=True)  
    #clientes_referidos = Column(Integer, nullable=True)  

    # Añadir relaciones inversas en los modelos existentes
    coupons = relationship("Coupon", foreign_keys="Coupon.user_id", back_populates="user")

# Limpieza: todos los imports son usados en este archivo.

# backend/schemas/coupon.py
# Esquema Pydantic para cupones y tipos de cupones

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class CouponBase(BaseModel):
    name: str
    description: Optional[str] = None
    unique_identifier: str
    expires_at: Optional[datetime] = None
    credits: int
    active: bool = True

class CouponCreate(CouponBase):
    pass
    coupon_type_id: int
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    issued_at: Optional[datetime] = None
    redeemed_at: Optional[datetime] = None
    status: Optional[str] = None

class CouponUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    expires_at: Optional[datetime] = None
    credits: Optional[int] = None
    active: Optional[bool] = None
    status: Optional[str] = None

class CouponResponse(CouponBase):
    id: int
    issued_at: datetime
    redeemed_at: Optional[datetime] = None
    status: str
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    redeemed_by_user_id: Optional[int] = None
    redeemed_by_session_id: Optional[str] = None

    class Config:
        from_attributes = True  # Reemplaza orm_mode=True, siguiendo la versión moderna de Pydantic

class CouponTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    credits: int
    active: bool = True

class CouponTypeCreate(CouponTypeBase):
    pass

class CouponTypeResponse(CouponTypeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# backend/schemas/credit_transaction.py
# Esquema Pydantic para transacciones de crédito

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
        from_attributes = True  # Reemplaza orm_mode = True

# backend/schemas/gamification.py
# Esquemas Pydantic para gamificación y ranking

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EventTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    points_per_event: int = 0

class EventTypeCreate(EventTypeBase):
    pass

class EventTypeResponse(EventTypeBase):
    id: int

    class Config:
        from_attributes = True

class BadgeBase(BaseModel):
    name: str
    description: Optional[str] = None
    event_type_id: int
    required_points: int
    user_type: str = "both"

class BadgeCreate(BadgeBase):
    pass

class BadgeResponse(BadgeBase):
    id: int

    class Config:
        from_attributes = True

class GamificationEventBase(BaseModel):
    event_type_id: int

class GamificationEventCreate(GamificationEventBase):
    pass

class GamificationEventResponse(GamificationEventBase):
    id: int
    user_id: Optional[int]
    session_id: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class UserGamificationBase(BaseModel):
    points: int
    badge_id: Optional[int]

class UserGamificationResponse(UserGamificationBase):
    event_type_id: int
    user_id: Optional[int]
    session_id: Optional[str]
    event_type: EventTypeResponse
    badge: Optional[BadgeResponse]

    class Config:
        from_attributes = True
        
        
class RankingResponse(BaseModel):
    username: str
    points: int
    badges_count: int
    user_type: str

    class Config:
        from_attributes = True

# backend/schemas/payment.py
# Esquemas Pydantic para pagos y métodos de pago

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PurchaseRequest(BaseModel):
    credits: int
    payment_amount: float
    payment_method: Optional[str] = "stripe"

class PurchaseResponse(BaseModel):
    transaction_id: int
    credits_added: int
    new_balance: int

class PaymentMethodCreate(BaseModel):
    payment_type: str
    details: str
    is_default: bool = False

class PaymentMethodResponse(BaseModel):
    id: int
    payment_type: str
    details: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permite mapear desde objetos SQLAlchemy
        
class CreditTransactionResponse(BaseModel):
    id: int
    amount: int
    transaction_type: str
    payment_amount: Optional[float] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True  # Permite mapear desde objetos SQLAlchemy
        
class PaymentProviderBase(BaseModel):
    name: str
    active: bool = True

class PaymentProviderCreate(PaymentProviderBase):
    pass

class PaymentProviderResponse(PaymentProviderBase):
    id: int

    class Config:
        from_attributes = True

# backend/schemas/user.py
# Esquemas Pydantic para usuarios y perfiles

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    ciudad: Optional[str] = None
    website: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    ciudad: Optional[str] = None
    website: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    rol: str
    activo: bool
    subscription: str  # Esto funciona porque Pydantic automáticamente usa el .value de los Enum
    ciudad: Optional[str] = None
    website: Optional[str] = None
    credits: int
    create_at: datetime
    last_ip: Optional[str] = None

    class Config:
        from_attributes = True  # Esto reemplaza a orm_mode = True en Pydantic v2

# backend/services/coupon_service.py
# Servicio para gestión y canje de cupones

from typing import Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session
from models.coupon import Coupon
from models.user import User
from models.guests import GuestsSession
from schemas.coupon import CouponCreate, CouponResponse, CouponUpdate
from core.logging import configure_logging
from fastapi import HTTPException
import uuid
from datetime import datetime, timedelta

logger = configure_logging()

def create_test_coupon(db: Session, coupon_type_id: int, admin_user_id: int):
    unique_id = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=24)  # Expira en 24 horas
    new_coupon = Coupon(
        coupon_type_id=coupon_type_id,
        name="Test Coupon",  # Valor predeterminado para el campo name
        unique_identifier=unique_id,
        status="active",
        credits=1,
        issued_at=datetime.utcnow(),
        expires_at=expires_at,
        active=True,
        user_id=admin_user_id  # Asignamos el cupón al admin
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

def get_coupon_activity(db: Session, page: int = 1, limit: int = 10) -> dict:
    """
    Obtiene la actividad de cupones con paginación.
    """
    offset = (page - 1) * limit
    total_items = db.query(Coupon).count()
    total_pages = (total_items + limit - 1) // limit

    coupons = (
        db.query(Coupon)
        .order_by(desc(Coupon.issued_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Serialización manual para coincidir con el frontend
    coupons_data = [
        {
            "id": coupon.id,
            "coupon_type": coupon.coupon_type_id,
            "unique_identifier": coupon.unique_identifier,
            "user_id": coupon.user_id,
            "session_id": coupon.session_id,
            "status": coupon.status,
            "issued_at": coupon.issued_at.isoformat(),
            "redeemed_at": coupon.redeemed_at.isoformat() if coupon.redeemed_at else None,
        }
        for coupon in coupons
    ]

    return {
        "data": coupons_data,
        "total_items": total_items,
        "total_pages": total_pages,
        "current_page": page,
    }

def create_coupon(db: Session, coupon_data: CouponCreate, user_id: Optional[int] = None, session_id: Optional[str] = None) -> Coupon:
    unique_identifier = str(uuid.uuid4())
    while db.query(Coupon).filter(Coupon.unique_identifier == unique_identifier).first():
        unique_identifier = str(uuid.uuid4())

    coupon = Coupon(
        coupon_type_id=coupon_data.coupon_type_id,
        name=coupon_data.name,
        credits=coupon_data.credits,
        description=coupon_data.description,
        unique_identifier=unique_identifier,
        expires_at=coupon_data.expires_at,
        active=coupon_data.active,
        user_id=user_id,
        session_id=session_id
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón creado: {coupon.unique_identifier}")
    return coupon

def get_coupon_by_id(db: Session, coupon_id: int) -> Coupon:
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    return coupon

def get_user_coupons(db: Session, user_id: Optional[int], session_id: Optional[str]) -> list[Coupon]:
    query = db.query(Coupon)
    if user_id:
        query = query.filter(Coupon.user_id == user_id)
    elif session_id:
        query = query.filter(Coupon.session_id == session_id)
    return query.all()

def get_all_coupons(db: Session) -> list[Coupon]:
    return db.query(Coupon).all()

def update_coupon(db: Session, coupon_id: int, coupon_update: CouponUpdate) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    for key, value in coupon_update.dict(exclude_unset=True).items():
        setattr(coupon, key, value)
    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón actualizado: {coupon.unique_identifier}")
    return coupon

def delete_coupon(db: Session, coupon_id: int):
    coupon = get_coupon_by_id(db, coupon_id)
    db.delete(coupon)
    db.commit()
    logger.info(f"Cupón eliminado: {coupon.unique_identifier}")
    return {"message": "Cupón eliminado"}

def redeem_coupon(db: Session, coupon_id: int, user_id: Optional[int], session_id: Optional[str]) -> Coupon:
    coupon = get_coupon_by_id(db, coupon_id)
    
    if coupon.status != "active":
        raise HTTPException(status_code=400, detail="Cupón no está activo")
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        coupon.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Cupón expirado")
    if (coupon.user_id and coupon.user_id != user_id) or (coupon.session_id and coupon.session_id != session_id):
        raise HTTPException(status_code=403, detail="Cupón no pertenece a este usuario/sesión")

    coupon.redeemed_at = datetime.utcnow()
    coupon.status = "redeemed"
    
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        user.credits += coupon.credits
        coupon.redeemed_by_user_id = user_id
    elif session_id:
        session = db.query(GuestsSession).filter(GuestsSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")
        session.credits += coupon.credits
        coupon.redeemed_by_session_id = session_id

    db.commit()
    db.refresh(coupon)
    logger.info(f"Cupón canjeado: {coupon.unique_identifier} por {user_id or session_id}")
    return coupon

# backend/services/credits_service.py
# Servicio para gestión y deducción de créditos
# Permitir la renovación automática o manual de créditos para usuarios registrados y anónimos.
from sqlalchemy.orm import Session
from models.user import User, subscriptionEnum
from models.credit_transaction import CreditTransaction
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from core.logging import configure_logging

logger = configure_logging()

def reset_credits(db: Session, freemium_credits: int = 100, premium_credits: int = 1000, reset_interval: int = 30):
    try:
        users = db.query(User).filter(User.activo == True).all()
        for user in users:
            if not user.renewal or user.renewal < datetime.utcnow() - timedelta(days=reset_interval):
                user.credits = freemium_credits if user.subscription == subscriptionEnum.FREEMIUM else premium_credits
                user.renewal = datetime.utcnow()
                db.add(CreditTransaction(
                    user_id=user.id,
                    user_type='registered',  # Corrección clave
                    amount=user.credits,
                    transaction_type="reset"
                ))
        db.commit()
    except Exception as e:
        logger.error(f"Error al reiniciar créditos: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al reiniciar créditos")

def deduct_credit(db: Session, user_id: int, amount: int = 1):
    try:
        user = db.query(User).filter(User.id == user_id).with_for_update().first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        if user.credits < amount:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No te quedan suficientes créditos")
        user.credits -= amount
        db.add(CreditTransaction(
            user_id=user_id,
            user_type='registered',  # Corrección clave
            amount=-amount,
            transaction_type="usage",
            description="Consulta realizada"  # Opcional, para consistencia con los logs
        ))
        db.commit()
        return user.credits
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al deducir créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al deducir créditos")

# backend/services/gamification_service.py
# Servicio para lógica de gamificación y ranking

from typing import List, Optional
from sqlalchemy.orm import Session
from models.guests import GuestsSession
from models.gamification import GamificationEvent, UserGamification, EventType, Badge
from schemas.gamification import GamificationEventCreate, EventTypeCreate, BadgeCreate, RankingResponse
from dependencies.auth import UserContext
from sqlalchemy import func
from models.gamification import EventType, Badge, GamificationEvent, UserGamification
from schemas.gamification import EventTypeCreate, BadgeCreate
from fastapi import HTTPException
from models.user import User
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from models.gamification import GamificationEvent, UserGamification, EventType, Badge
from schemas.gamification import GamificationEventCreate
from dependencies.auth import UserContext


# backend/services/gamification_service.py

def register_event(db: Session, event: GamificationEventCreate, user: UserContext) -> GamificationEvent:
    """Registra un evento de gamificación y actualiza los puntos del usuario."""
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None

    db_event = GamificationEvent(
        event_type_id=event.event_type_id,
        user_id=user_id,
        session_id=session_id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    update_user_gamification(db, user, event.event_type_id)
    return db_event

def get_user_gamification(db: Session, user: UserContext) -> List[UserGamification]:
    """Obtiene todos los registros de gamificación del usuario."""
    if user.user_type == "registered":
        return db.query(UserGamification).filter(UserGamification.user_id == int(user.user_id)).all()
    return db.query(UserGamification).filter(UserGamification.session_id == user.session_id).all()

def get_user_events(db: Session, user: UserContext) -> List[GamificationEvent]:
    """Obtiene todos los eventos de gamificación del usuario."""
    if user.user_type == "registered":
        return db.query(GamificationEvent).filter(GamificationEvent.user_id == int(user.user_id)).all()
    return db.query(GamificationEvent).filter(GamificationEvent.session_id == user.session_id).all()

def get_event_details(db: Session, event_id: int, user: UserContext) -> Optional[GamificationEvent]:
    """Obtiene los detalles de un evento específico si pertenece al usuario."""
    event = db.query(GamificationEvent).filter(GamificationEvent.id == event_id).first()
    if not event:
        return None
    if (user.user_type == "registered" and event.user_id == int(user.user_id)) or \
       (user.user_type == "anonymous" and event.session_id == user.session_id):
        return event
    return None

def get_badges_for_event(db: Session, event_type_id: int) -> List[Badge]:
    """Obtiene todos los badges asociados a un tipo de evento."""
    return db.query(Badge).filter(Badge.event_type_id == event_type_id).all()

def get_user_progress_for_event(db: Session, user: UserContext, event_type_id: int) -> Optional[UserGamification]:
    """Obtiene el progreso del usuario para un tipo de evento específico."""
    if user.user_type == "registered":
        return db.query(UserGamification).filter(
            UserGamification.user_id == int(user.user_id),
            UserGamification.event_type_id == event_type_id
        ).first()
    return db.query(UserGamification).filter(
        UserGamification.session_id == user.session_id,
        UserGamification.event_type_id == event_type_id
    ).first()



def update_user_gamification(db: Session, user: UserContext, event_type_id: int) -> UserGamification:
    logging.info(f"Actualizando gamificación para user_type={user.user_type}, user_id={user.user_id}, session_id={user.session_id}, event_type_id={event_type_id}")
    user_id = int(user.user_id) if user.user_type == "registered" else None
    session_id = user.session_id if user.user_type == "anonymous" else None

    gamification = get_user_progress_for_event(db, user, event_type_id)
    if not gamification:
        gamification = UserGamification(
            user_id=user_id,
            session_id=session_id,
            event_type_id=event_type_id,
            points=0
        )
        db.add(gamification)
        logging.info("Creado nuevo registro de UserGamification")

    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise ValueError("Event type not found")

    events_count = db.query(GamificationEvent).filter(
        GamificationEvent.event_type_id == event_type_id,
        (GamificationEvent.user_id == user_id) if user_id else (GamificationEvent.session_id == session_id)
    ).count()
    logging.info(f"Contados {events_count} eventos para event_type_id={event_type_id}")

    gamification.points = events_count * event_type.points_per_event

    badge = db.query(Badge).filter(
        Badge.event_type_id == event_type_id,
        Badge.user_type.in_([user.user_type, "both"]),
        Badge.required_points <= gamification.points
    ).order_by(Badge.required_points.desc()).first()
    logging.info(f"Badge encontrado: {badge.id if badge else 'None'}")

    gamification.badge_id = badge.id if badge else None
    db.commit()
    db.refresh(gamification)
    return gamification
# Funciones para EventType
def create_event_type(db: Session, event_type: EventTypeCreate):
    db_event_type = EventType(**event_type.dict())
    db.add(db_event_type)
    db.commit()
    db.refresh(db_event_type)
    return db_event_type

def get_event_types(db: Session) -> List[EventType]:
    return db.query(EventType).all()

def update_event_type(db: Session, event_type_id: int, event_type_update: EventTypeCreate):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    for key, value in event_type_update.dict().items():
        setattr(event_type, key, value)
    db.commit()
    db.refresh(event_type)
    return event_type

def delete_event_type(db: Session, event_type_id: int):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    db.delete(event_type)
    db.commit()
    return {"message": "Event type deleted"}

# Funciones para Badge
def create_badge(db: Session, badge: BadgeCreate):
    db_badge = Badge(**badge.dict())
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge

def get_badges(db: Session) -> List[Badge]:
    return db.query(Badge).all()

def update_badge(db: Session, badge_id: int, badge_update: BadgeCreate):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    for key, value in badge_update.dict().items():
        setattr(badge, key, value)
    db.commit()
    db.refresh(badge)
    return badge

def delete_badge(db: Session, badge_id: int):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    db.delete(badge)
    db.commit()
    return {"message": "Badge deleted"}

#def calculate_points(api_usages: int) -> int:
#    """Calcula los puntos según el número de usos de la API."""
#    if api_usages >= 30:
#        return 1000
#    elif api_usages >= 20:
#        return 500
#    elif api_usages >= 10:
#        return 100
#    elif api_usages >= 1:
#        return 5
#    return 0



def get_rankings(db: Session) -> List[RankingResponse]:
    # Rankings para usuarios registrados
    registered = db.query(
        User.username,
        func.sum(UserGamification.points).label("total_points"),
        func.count(UserGamification.badge_id).label("badges_count")
    ).join(UserGamification, User.id == UserGamification.user_id
    ).group_by(User.id).all()

    # Rankings para usuarios anónimos
    anonymous = db.query(
        GuestsSession.username,
        func.sum(UserGamification.points).label("total_points"),
        func.count(UserGamification.badge_id).label("badges_count")
    ).join(UserGamification, GuestsSession.id == UserGamification.session_id
    ).group_by(GuestsSession.id).all()

    all_rankings = [
        RankingResponse(
            username=r.username,
            points=r.total_points,
            badges_count=r.badges_count,
            user_type="registered" if r in registered else "anonymous"
        ) for r in registered + anonymous
    ]
    return sorted(all_rankings, key=lambda x: x.points, reverse=True)


def get_event_types(db: Session) -> List[EventType]:
    return db.query(EventType).all()

def update_event_type(db: Session, event_type_id: int, event_type_update: EventTypeCreate):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    for key, value in event_type_update.dict().items():
        setattr(event_type, key, value)
    db.commit()
    db.refresh(event_type)
    return event_type

def delete_event_type(db: Session, event_type_id: int):
    event_type = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    db.delete(event_type)
    db.commit()
    return {"message": "Event type deleted"}

def get_badges(db: Session) -> List[Badge]:
    return db.query(Badge).all()

def update_badge(db: Session, badge_id: int, badge_update: BadgeCreate):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    for key, value in badge_update.dict().items():
        setattr(badge, key, value)
    db.commit()
    db.refresh(badge)
    return badge

def delete_badge(db: Session, badge_id: int):
    badge = db.query(Badge).filter(Badge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    db.delete(badge)
    db.commit()
    return {"message": "Badge deleted"}

# backend/services/payment_service.py
# Servicio para pagos y métodos de pago de usuarios
from sqlalchemy.orm import Session
from schemas.payment import PaymentMethodResponse
from models.payment_method import PaymentMethod
from models.user import User
from core.logging import configure_logging
from models.credit_transaction import CreditTransaction
from fastapi import HTTPException, status

logger = configure_logging()

class StripeSimulator:
    @staticmethod
    def create_payment_intent(amount: float, currency: str = "usd"):
        return {"id": "pi_simulated", "status": "succeeded"}

stripe = StripeSimulator()

def purchase_credits(db: Session, user_id: int, credits: int, payment_amount: float, payment_method: str = "stripe"):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        transaction = CreditTransaction(
            user_type="registered",  # ¡Añadimos esto explícitamente!
            user_id=user_id,
            amount=credits,
            transaction_type="purchase",
            payment_amount=payment_amount,
            payment_method=payment_method,
            payment_status="pending"
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        payment_intent = stripe.create_payment_intent(payment_amount)
        if payment_intent["status"] == "succeeded":
            transaction.payment_status = "completed"
            user.credits += credits
            db.commit()
            logger.info(f"Compra de {credits} créditos completada para usuario {user_id}")
            return {"transaction_id": transaction.id, "credits_added": credits, "new_balance": user.credits}
        else:
            transaction.payment_status = "failed"
            db.commit()
            raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Error al procesar el pago")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al procesar compra de créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al procesar compra")

def add_payment_method(db: Session, user_id: int, payment_type: str, details: str, is_default: bool = False):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        if is_default:
            db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).update({"is_default": False})
        
        payment_method = PaymentMethod(
            user_id=user_id,
            payment_type=payment_type,
            details=details,
            is_default=is_default
        )
        db.add(payment_method)
        db.commit()
        logger.info(f"Método de pago añadido para usuario ID {user_id}: {payment_type}")
        return payment_method
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al añadir método de pago para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al añadir método de pago")

def get_payment_methods(db: Session, user_id: int):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).all()
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al listar métodos de pago para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al listar métodos de pago")

def set_default_payment_method(db: Session, user_id: int, payment_method_id: int):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == payment_method_id, PaymentMethod.user_id == user_id).first()
        if not payment_method:
            raise HTTPException(status_code=404, detail="Método de pago no encontrado")
        
        db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id, PaymentMethod.is_default == True).update({"is_default": False})
        payment_method.is_default = True
        db.commit()
        logger.info(f"Método de pago ID {payment_method_id} establecido como predeterminado para usuario ID {user_id}")
        return payment_method
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al establecer método de pago predeterminado para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al establecer método de pago")

def get_credit_transactions(db: Session, user_id: int):
    try:
        return db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id).all()
    except Exception as e:
        logger.error(f"Error al obtener transacciones de créditos para usuario {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al obtener transacciones")
    
    
def update_payment_method(db: Session, user_id: int, method_id: int, payment_type: str, details: str) -> PaymentMethodResponse:
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id, PaymentMethod.user_id == user_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    method.payment_type = payment_type
    method.details = details
    db.commit()
    db.refresh(method)
    return PaymentMethodResponse.from_orm(method)

def delete_payment_method(db: Session, user_id: int, method_id: int):
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id, PaymentMethod.user_id == user_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")
    if method.is_default:
        raise HTTPException(status_code=400, detail="No se puede eliminar el método de pago predeterminado")
    db.delete(method)
    db.commit()

# backend/services/user_service.py
# Servicio para gestión y actualización de usuarios

from sqlalchemy.orm import Session
from models.user import User
from fastapi import HTTPException

# Limpieza: todos los imports son usados en este archivo.

def get_user_info(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def update_user(db: Session, user_id: int, email: str = None, username: str = None, ciudad: str = None, website: str = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if email and email != user.email:
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = email
    
    if username and username != user.username:
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="El username ya está en uso")
        user.username = username
    
    if ciudad is not None:
        user.ciudad = ciudad
    if website is not None:
        user.website = website
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado"}

def list_users(db: Session):
    return db.query(User).all()

// frontend/src/components/web/Navbar.tsx
// Barra de navegación principal con estado de usuario y notificaciones
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import fetchAPI from "@/lib/api";
import {
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  styled,
  Box,
  Typography,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge
} from "@mui/material";
import {
  MonetizationOn,
  Settings,
  ListAlt,
  People,
  Dashboard,
  Login,
  PersonAdd,
  Person,
  Home,
  Star,
  EmojiEvents,
  Leaderboard,
  School,
  Menu as MenuIcon,
  ContactMail,
  Close,
  Key,
  LocalActivity
} from "@mui/icons-material";
import Image from "next/image";

const GlassNavbar = styled("nav")(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1
  },
}));

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, credits, gamification, coupons, setCredits, setGamification, logout } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enablePoints, setEnablePoints] = useState(true);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [enableBadges, setEnableBadges] = useState(true);
  const [enablePaymentMethods, setEnablePaymentMethods] = useState(true);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  useEffect(() => {
    const storedAnonUsername = localStorage.getItem("anonUsername");
    setAnonUsername(storedAnonUsername);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [
          disableCreditsRes,
          enableRegistrationRes,
          enablePointsRes,
          enableCouponsRes,
          enableBadgesRes,
          enablePaymentMethodsRes,
        ] = await Promise.all([
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_coupons"),
          fetchAPI("/v1/settings/enable_badges"),
          fetchAPI("/v1/settings/enable_payment_methods"),
        ]);
        setDisableCredits(disableCreditsRes.data === "true" || disableCreditsRes.data === true);
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
        setEnablePoints(enablePointsRes.data === "true" || enablePointsRes.data === true);
        setEnableCoupons(enableCouponsRes.data === "true" || enableCouponsRes.data === true);
        setEnableBadges(enableBadgesRes.data === "true" || enableBadgesRes.data === true);
        setEnablePaymentMethods(enablePaymentMethodsRes.data === "true" || enablePaymentMethodsRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
      }
    };
    fetchSettings();
  }, []);

  interface InfoData {
    credits: number;
  }

  useEffect(() => {
    if (!enablePoints && !enableBadges) return;

    const interval = setInterval(async () => {
      try {
        const { data: infoData } = await fetchAPI<InfoData>("/whoami");
        if (infoData) {
          setCredits(infoData.credits);
        }

        const { data: gamificationData } = await fetchAPI("/v1/gamification/me");
        if (gamificationData && Array.isArray(gamificationData)) {
          const totalPoints = enablePoints
            ? gamificationData.reduce((sum, g) => sum + g.points, 0)
            : 0;
          const badges = enableBadges
            ? gamificationData.map((g) => g.badge).filter((b) => b !== null)
            : [];

          const previousBadges = JSON.parse(localStorage.getItem("badges") || "[]");
          const currentBadgeIds = badges.map((b) => b.id);
          const newBadges = currentBadgeIds.filter((id) => !previousBadges.includes(id));
          if (newBadges.length > 0 && enableBadges) {
            const badge = badges.find((b) => b.id === newBadges[0]);
            setNewBadge(badge?.name || "Nuevo badge");
            setSnackbarOpen(true);
            localStorage.setItem("badges", JSON.stringify(currentBadgeIds));
          }

          setGamification({ points: totalPoints, badges });
        }
      } catch (err) {
        console.error("Error al actualizar datos:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [setCredits, setGamification, enablePoints, enableBadges]);

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  // Contar cupones activos y no expirados
  const availableCoupons = (coupons || []).filter(
    (coupon) =>
      coupon && // Verifica que coupon no sea null/undefined
      coupon.status === "active" &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date())
  ).length;

  return (
    <GlassNavbar>
      <NavContainer>
        {/* Sección izquierda: Logo y menú hamburguesa */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleDrawerOpen}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Link href="/" passHref>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer"
              }}>
                <Image
                  src="/logo.png"
                  alt="Logo Neptuno"
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                />
                <Typography
                  variant="h6"
                  component="span"
                  className="app-logo"
                  sx={{
                    fontWeight: "bold",
                    display: {
                      xs: 'none', // Oculto en móvil
                      md: 'block' // Visible en desktop
                    }
                  }}
                >
                  Neptuno
                </Typography>
              </Box>
            </Link>
          </Box>
        </Box>

        {/* Sección derecha: Todos los elementos */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Enlaces desktop + iconos */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Enlaces desktop */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, mr: 1 }}>
              <Button
                component={Link}
                href="/ejemplos"
                className={pathname === '/ejemplos' ? 'active-link' : ''}
              >
                Ejemplos
              </Button>
              <Button
                component={Link}
                href="/rankings"
                className={pathname === '/rankings' ? 'active-link' : ''}
              >
                Rankings
              </Button>
            </Box>

            {/* Iconos de notificaciones */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!disableCredits && credits > 0 && (
                <Link href="/user/transactions" passHref>
                  <IconButton className="notification-icon">
                    <MonetizationOn />
                    <span className="notification-badge credits-badge">{credits}</span>
                  </IconButton>
                </Link>
              )}

              {/* Cupones */}
              {enableCoupons && (
                <Link href="/user/coupon" passHref>
                  <Tooltip title="Tus cupones">
                    <IconButton className="notification-icon">
                      <Badge badgeContent={availableCoupons} color="secondary">
                        <LocalActivity />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Link>
              )}

              {gamification && (
                <>
                  {enablePoints && (
                    <Link href="/user/points" passHref>
                      <IconButton className="notification-icon">
                        <Star />
                        <span className="notification-badge points-badge">{gamification.points}</span>
                      </IconButton>
                    </Link>
                  )}
                  {enableBadges && (
                    <Link href="/user/badges" passHref>
                      <IconButton className="notification-icon">
                        <EmojiEvents />
                        <span className="notification-badge badges-badge">{gamification.badges.length}</span>
                      </IconButton>
                    </Link>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Menú admin y usuario */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user?.rol === "admin" && (
              <>
                <IconButton
                  onClick={handleSettingsMenuOpen}
                  sx={{ color: "inherit" }}
                >
                  <Settings />
                </IconButton>
                <Menu
                  anchorEl={settingsAnchorEl}
                  open={Boolean(settingsAnchorEl)}
                  onClose={handleSettingsMenuClose}
                  PaperProps={{
                    sx: {
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      mt: 1,
                      minWidth: "200px",
                    },
                  }}
                >
                  <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/dashboard">
                    <Dashboard sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/registry">
                    <ListAlt sx={{ mr: 1 }} /> Registros
                  </MenuItem>
                  <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/users">
                    <People sx={{ mr: 1 }} /> Usuarios
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Avatar de usuario */}
            {user ? (
              <Tooltip title={user.username} arrow>
                <IconButton
                  component={Link}
                  href="/user/dashboard"
                  className="user-avatar"
                >
                  <Avatar sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    fontSize: '1rem'
                  }}>
                    {user.username[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={anonUsername ? "Iniciar sesión" : "Registrarse"} arrow>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    component={Link}
                    href={anonUsername ? "/user/auth/#login" : "/user/auth/#register"}
                    className="user-avatar"
                  >
                    <Avatar sx={{
                      bgcolor: theme.palette.grey[500],
                      width: 40,
                      height: 40,
                      color: theme.palette.common.white
                    }}>
                      {anonUsername ? <Person /> : <Key />}
                    </Avatar>
                  </IconButton>
                  {anonUsername && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: theme.palette.secondary.main,
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${theme.palette.background.paper}`
                    }}>
                      <Key sx={{ fontSize: 12, color: theme.palette.common.white }} />
                    </Box>
                  )}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Menú hamburguesa */}
        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
          <List>
            {/* Header del menú */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Image
                  src="/logo.png"
                  alt="Logo Neptuno"
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block",
                  }}
                >
                  Neptuno
                </Typography>
              </Box>
              <IconButton onClick={handleDrawerClose}>
                <Close />
              </IconButton>
            </Box>

            <ListItem component={Link} href="/">
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItem>
            <ListItem component={Link} href="/ejemplos">
              <ListItemIcon><School /></ListItemIcon>
              <ListItemText primary="Ejemplos" />
            </ListItem>
            <ListItem component={Link} href="/rankings">
              <ListItemIcon><Leaderboard /></ListItemIcon>
              <ListItemText primary="Rankings" />
            </ListItem>
            <ListItem component={Link} href="/about/contact">
              <ListItemIcon><ContactMail /></ListItemIcon>
              <ListItemText primary="Contacto" />
            </ListItem>

            {user?.rol === "admin" && (
              <>
                <ListItem component={Link} href="/admin/dashboard">
                  <ListItemIcon><Dashboard /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem component={Link} href="/admin/registry">
                  <ListItemIcon><ListAlt /></ListItemIcon>
                  <ListItemText primary="Registros" />
                </ListItem>
                <ListItem component={Link} href="/admin/users">
                  <ListItemIcon><People /></ListItemIcon>
                  <ListItemText primary="Usuarios" />
                </ListItem>
              </>
            )}
            {user ? (
              <ListItem component={Link} href="/user/dashboard">
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary={user.username} />
              </ListItem>
            ) : (
              <>
                <ListItem component={Link} href="/user/auth/#login">
                  <ListItemIcon><Login /></ListItemIcon>
                  <ListItemText primary="Iniciar Sesión" />
                </ListItem>
                {enableRegistration && (
                  <ListItem component={Link} href="/user/auth/#register">
                    <ListItemIcon><PersonAdd /></ListItemIcon>
                    <ListItemText primary="Registrarse" />
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Drawer>
      </NavContainer>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          ¡Felicidades! Has obtenido el badge: {newBadge}
        </Alert>
      </Snackbar>
    </GlassNavbar >
  );
}

aqui tienes elementos reutilizables visuales usados en el sitio

// frontend/src/components/ui/Styled.tsx
// This file contains styled components for the application using Material-UI's styled API.
// It includes custom styles for tabs, chips, cards, and other UI elements.
// The styles are defined using the theme provided by Material-UI, allowing for consistent theming across the application.
import { styled } from '@mui/material/styles';
import { Chip, Tabs, Paper, Card } from '@mui/material';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '2px',
  },
  '& .MuiTab-root': {
    color: theme.palette.text.primary,
    opacity: 0.8,
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'capitalize',
    padding: '12px 16px',
    minHeight: 'auto',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      opacity: 1,
      fontWeight: 600,
    },
    '&:hover': {
      opacity: 1,
      color: theme.palette.primary.dark,
    },
  },
}));

export const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '2px 8px',
  height: 'auto',
  color: 'white',
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.main,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.main,
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.main,
  },
  '&.MuiChip-colorDefault': {
    backgroundColor: theme.palette.grey[500],
  },
}));

export const StyledCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: theme.shadows[4],
  border: '1px solid rgba(222, 226, 230, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    background: 'rgba(248, 249, 250, 0.95)',
  },
}));

export const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: theme.shadows[4]
}));

export const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(222, 226, 230, 0.5)',
  borderRadius: '16px',
  boxShadow: theme.shadows[2]
}));

export const AdminGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

export const ConfigGlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5]
}));

export const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

// frontend/src/components/ui/index.tsx
// Componentes UI reutilizables (spinner, glass card, etc)
import { ReactNode } from "react";
import { motion } from "framer-motion";

export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"
  />
);

export const GlassCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 ${className}`}
    whileHover={{ scale: 1.02 }}
  >
    {children}
  </motion.div>
);

export const GradientText = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={`bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

export const BadgeIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, string> = {
    'api_usage': '💻',
    'survey_completed': '📝',
    'registration_completed': '🎯',
    'all_subscriptions': '📬',
    'default': '🏆'
  };
  
  return <div className={`${className} flex items-center justify-center text-4xl`}>{icons[type] || icons.default}</div>;
};

export const TimelineIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, string> = {
    'api_usage': '⬆️',
    'survey_completed': '✅',
    'registration_completed': '📋',
    'all_subscriptions': '📩',
    'default': '✨'
  };
  
  return <span className={`${className} text-2xl`}>{icons[type] || icons.default}</span>;
};

export const EmptyState = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mx-auto">{description}</p>
  </div>
);

// components/ui/index.tsx
export const RankingMedal = ({ position }: { position: number }) => {
  const colors = {
    1: "from-yellow-400 to-yellow-600",
    2: "from-gray-400 to-gray-600",
    3: "from-amber-600 to-amber-800",
    default: "from-purple-500 to-pink-500"
  };

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center 
      bg-gradient-to-r ${colors[position as keyof typeof colors] || colors.default}`}>
      <span className="font-bold text-white">{position}</span>
    </div>
  );
};

export const InteractiveDemo = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="relative overflow-hidden rounded-xl"
    whileHover={{ scale: 1.02 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
    <div className="relative backdrop-blur-sm p-8">
      {children}
    </div>
  </motion.div>
);

export { StyledTabs, StatusChip, StyledCard } from './Styled';
export { default as FeatureDisabled } from './FeatureDisabled';
export { GradientCard, AdminGradientCard, ConfigGlassCard, FeatureCard } from './Styled';

// frontend/src/components/ui/FilterableTabs.tsx
// This component renders a set of tabs that can be filtered based on the provided props.
// It uses Material-UI's Tabs and Tab components for styling and functionality.
// The tabs are passed as props, and the selected tab is managed using React's useState hook.
import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface FilterableTabsProps {
  tabs: { label: string; value: string }[];
  onTabChange: (value: string) => void;
  initialTab?: string;
}

const FilterableTabs: React.FC<FilterableTabsProps> = ({ tabs, onTabChange, initialTab }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab || tabs[0].value);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={selectedTab} onChange={handleChange} aria-label="filterable tabs">
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
};

export default FilterableTabs;


// from frontend/src/components/ui/FeatureStateHandler.tsx
// This component handles the display of a feature based on its enabled state.
// It shows a loading spinner while checking the state and displays a message if the feature is disabled.
// If the feature is enabled, it renders the children components passed to it.
// It uses Material-UI for styling and layout.
// The component is designed to be reusable and can be used in various parts of the application where feature state handling is required.
import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface FeatureStateHandlerProps {
  isEnabled: boolean | null;
  message: string;
  children?: ReactNode;
}

const FeatureStateHandler: React.FC<FeatureStateHandlerProps> = ({ isEnabled, message, children }) => {
  if (isEnabled === null) return null;

  if (!isEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          p: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default FeatureStateHandler;

// from: frontend/src/components/ui/FeatureDisabled.tsx
// This component handles the display of a feature based on its enabled state.
// It shows a loading spinner while checking the state and displays a message if the feature is disabled.
// If the feature is enabled, it renders the children components passed to it.
// It uses Material-UI for styling and layout.
// The component is designed to be reusable and can be used in various parts of the application where feature state handling is required.
import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface FeatureDisabledProps {
  message: string;
  isEnabled: boolean | null;
  children?: ReactNode;
}

const FeatureDisabled: React.FC<FeatureDisabledProps> = ({ message, isEnabled, children }) => {
  if (isEnabled === null) return null;

  if (!isEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default FeatureDisabled;

// frontend/src/components/dashboard/DashboardUI.tsx
// Componentes de UI reutilizables para dashboards
import { Card, styled } from "@mui/material";

export const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: theme.shadows[4]
}));

export const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(222, 226, 230, 0.5)',
  borderRadius: '16px',
  boxShadow: theme.shadows[2]
}));

export const AdminGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

export const ConfigGlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5]
}));

export const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

// frontend/src/lib/auth/context.tsx
// Contexto de autenticación y estado global del usuario

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { User, TokenResponse, RegisterRequest, UserInfo, Gamification, Badge, Coupon } from "../types";
import { motion } from "framer-motion";
import { GamificationEventCreate, GamificationEventResponse, UserGamificationResponse } from "../types";

interface AuthContextType {
  user: User | null;
  credits: number;
  gamification: Gamification | null; // Añadimos gamificación al contexto
  coupons: Coupon[];
  setCredits: (credits: number) => void; // Añadido
  setCoupons: (coupons: Coupon[]) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setGamification: (gamification: Gamification) => void; // Añadido
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => void;
  refreshToken: () => Promise<string | null>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(10); // Valor por defecto para anónimos
  const [gamification, setGamification] = useState<Gamification | null>(null); // Estado para gamificación
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await fetchAPI<any>("/whoami"); // Endpoint para obtener info del usuario
        if (data) {
          if (data.user_type === "registered") {
            setUser({
              id: parseInt(data.user_id!),
              email: data.email!,
              username: data.username!,
              rol: data.rol!,
              activo: true,
              subscription: data.subscription!,
              credits: data.credits,
              create_at: "",
              last_ip: "",
              last_login: "",
              user_type: data.user_type,
            });
            setCredits(data.credits);
          } else if (data.user_type === "anonymous") {
            setUser(null);
            setCredits(data.credits);
            localStorage.setItem("session_id", data.session_id!);
          } else {
            setUser(null);
            setCredits(0);
          }

          // Obtener datos de gamificación
          const gamificationRes = await fetchAPI<any[]>("/v1/gamification/me");
          if (gamificationRes.data) {
            const totalPoints = gamificationRes.data.reduce((sum, g) => sum + g.points, 0);
            const badges = gamificationRes.data.map(g => g.badge).filter(Boolean) as Badge[];
            setGamification({ points: totalPoints, badges });
          } else {
            setGamification({ points: 0, badges: [] });
          }

          // Obtener cupones del usuario
          const couponsRes = await fetchAPI<Coupon[]>("/v1/coupons/me");
          setCoupons(couponsRes.data || []);
        }
      } catch (err) {
        console.error("Error en checkAuth:", err);
        setUser(null);
        setCredits(0);
        setGamification({ points: 0, badges: [] });
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await fetchAPI<TokenResponse>(
      "/v1/auth/token",
      {
        method: "POST",
        data: { username: email, password, grant_type: "password" },
      },
      "application/x-www-form-urlencoded"
    );
    if (error) throw new Error(typeof error === "string" ? error : "Error al iniciar sesión");
    localStorage.setItem("accessToken", data!.access_token);
    localStorage.setItem("refreshToken", data!.refresh_token);
    localStorage.removeItem("session_id");  // Limpiar session_id al iniciar sesión
    const userResponse = await fetchAPI<User>("/v1/users/me");
    if (userResponse.data) {
      setUser(userResponse.data);
      setCredits(userResponse.data.credits);
      router.push("/user/dashboard");
    }
  };

  const logout = async () => {
    try {
      await fetchAPI("/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("session_id");  // Limpiar session_id al cerrar sesión
    setUser(null);
    // const anonCredits = localStorage.getItem("anonCredits");
    // setCredits(anonCredits ? parseInt(anonCredits) : 100);
    router.push("/");
  };

  const register = async (data: RegisterRequest) => {
    const { error } = await fetchAPI("/v1/auth/register", {
      method: "POST",
      data,
    });
    if (error) throw new Error(typeof error === "string" ? error : "Error al registrarse");
    await login(data.email, data.password);
  };

  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login/google`;
  };

  const refreshToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      await logout();
      return null;
    }

    try {
      const { data, error } = await fetchAPI<TokenResponse>("/v1/auth/refresh", {
        method: "POST",
        data: { refresh_token: refresh },
        ...(true && { _retry: true }) // Evitar bucle infinito
      });

      if (error || !data) {
        throw new Error(typeof error === "string" ? error : JSON.stringify(error) || "Refresh failed");
      }

      // Actualizar localStorage ANTES de cualquier otra operación
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      // Actualizar estado del usuario
      const userResponse = await fetchAPI<User>("/v1/users/me");
      if (userResponse.data) {
        setUser(userResponse.data);
        setCredits(userResponse.data.credits);
      }

      return data.access_token;
    } catch (err) {
      console.error("Refresh error:", err);
      await logout();
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetchAPI<User>("/v1/users/me", {
        method: "PUT",
        data,
      });
      if (response.error) throw new Error(typeof response.error === "string" ? response.error : JSON.stringify(response.error));
      if (response.data) {
        setUser(response.data);
        setCredits(response.data.credits);
      } else {
        throw new Error("No se recibió la información del usuario actualizado");
      }
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      throw err;
    }
  };

  const deleteProfile = async () => {
    const { error } = await fetchAPI("/v1/users/me", { method: "DELETE" });
    if (error) throw new Error(typeof error === "string" ? error : "Error al eliminar perfil");
    logout();
  };

  const resetPassword = async (email: string) => {
    const { error } = await fetchAPI("/v1/auth/password-reset", {
      method: "POST",
      data: { email },
    });
    if (error) throw new Error(typeof error === "string" ? error : "Error al restablecer contraseña");
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-[var(--background)] z-50"
      >
        <div className="text-[var(--foreground)] text-xl font-semibold">
          Cargando Neptuno...
        </div>
      </motion.div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, credits, gamification, coupons, setCoupons, setGamification, setCredits, login, logout, register, loginWithGoogle, refreshToken, updateProfile, deleteProfile, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// frontend/src/lib/api.ts
// Cliente Axios y funciones para consumir la API

// src/lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from "axios";
import { useState, useEffect } from 'react';
import { HTTPValidationError, FetchResponse, RegisterRequest, TokenResponse, UpdateProfileRequest, User, ValidationError } from "./types";

// Extender AxiosRequestConfig para incluir _retry
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Crear una instancia personalizada de Axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Variables para manejar el estado de refresco
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Agregar el interceptor de solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const sessionId = localStorage.getItem("session_id");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }
  return config;
});

const logRequest = (method: string, url: string, status: number, data?: unknown) => {
  console.log(`[${method}] ${url} - Status: ${status}`, data ?? "");
};

const fetchAPI = async <T>(
  endpoint: string,
  options: CustomAxiosRequestConfig = {},
  contentType: string = "application/json"
): Promise<FetchResponse<T>> => {
  console.log(`Iniciando fetchAPI para ${endpoint}`);

  const config: CustomAxiosRequestConfig = {
    ...options,
    url: endpoint, // baseURL ya está configurado en la instancia
    headers: {
      "Content-Type": contentType,
      ...options.headers,
    },
    data: options.data,
  };

  // Convertir datos a formato x-www-form-urlencoded si es necesario
  if (contentType === "application/x-www-form-urlencoded" && config.data) {
    const formData = new URLSearchParams();
    Object.entries(config.data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    config.data = formData;
  }

  const normalizeResponse = (
    response: AxiosResponse<T> | undefined,
    error: unknown
  ): FetchResponse<T> => {
    if (response && response.status >= 200 && response.status < 300) {
      return { data: response.data, error: null };
    }

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData && errorData.detail) {
        if (typeof errorData.detail === "string") {
          return { data: null, error: errorData.detail };
        } else if (Array.isArray(errorData.detail)) {
          const messages = errorData.detail
            .map((err: ValidationError) => err.msg)
            .join(", ");
          return { data: null, error: messages };
        }
      }
    }

    return { data: null, error: "Error desconocido" };
  };

  try {
    const response: AxiosResponse<T> = await api(config); // Usar la instancia 'api'
    logRequest(config.method || "GET", config.url!, response.status, response.data);

    if (response.data && (response.data as any).session_id) {
      localStorage.setItem("session_id", (response.data as any).session_id);
    }

    return normalizeResponse(response, null);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logRequest(
      config.method || "GET",
      config.url!,
      axiosError.response?.status || 500,
      axiosError.response?.data
    );

    if (axiosError.response?.status === 401 && !config._retry) {
      const originalRequest: CustomAxiosRequestConfig = config;
      originalRequest._retry = true;

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                api(originalRequest)
                  .then(response => resolve(normalizeResponse(response, null)))
                  .catch(error => reject(normalizeResponse(undefined, error)));
              },
              reject: (error) => reject(normalizeResponse(undefined, error)),
            });
          });
        }

        isRefreshing = true;

        try {
          console.log("Intentando refrescar token de acceso");
          const refreshResponse = await api.post<TokenResponse>(
            "/v1/auth/refresh",
            { refresh_token: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

          localStorage.setItem("accessToken", refreshResponse.data.access_token);
          localStorage.setItem("refreshToken", refreshResponse.data.refresh_token);

          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
          processQueue(null, refreshResponse.data.access_token);

          const retryResponse = await api(originalRequest);
          return normalizeResponse(retryResponse, null);
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("session_id");
          processQueue(refreshError, null);
          window.location.href = "/user/auth/#login";
          return normalizeResponse(undefined, {
            message: "Sesión expirada, por favor inicia sesión nuevamente",
          });
        } finally {
          isRefreshing = false;
        }
      } else {
        return normalizeResponse(undefined, { message: "No autorizado" });
      }
    }

    return normalizeResponse(undefined, err);
  }
};

// Custom hook to fetch data
export const useFetchData = <T>(
  endpoint: string,
  options: CustomAxiosRequestConfig = {},
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: string | null } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAPI<T>(endpoint, options);
        if (response.error) {
          setError(typeof response.error === 'string' ? response.error : 'Error desconocido');
        } else {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Funciones específicas de la API
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<FetchResponse<{
  data: User[],
  total_items: number,
  total_pages: number,
  current_page: number
}>> => {
  return fetchAPI(`/v1/users/admin/users?page=${page}&limit=${limit}`, {
    method: "GET"
  });
};

export const getUserById = async (
  userId: number
): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, {
    method: "GET"
  });
};

export const updateUser = async (
  userId: number,
  data: UpdateProfileRequest
): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, {
    method: "PUT",
    data
  });
};

export const deleteUser = async (
  userId: number
): Promise<FetchResponse<void>> => {
  return fetchAPI<void>(`/v1/users/${userId}`, {
    method: "DELETE"
  });
};

export const createUser = async (
  data: RegisterRequest
): Promise<FetchResponse<TokenResponse>> => {
  return fetchAPI<TokenResponse>("/v1/auth/register", {
    method: "POST",
    data
  });
};

export default fetchAPI;

// frontend/src/hooks/useFetchData.ts
// frontend/src/hooks/useFetchData.ts
// Custom hook para realizar peticiones HTTP y manejar el estado de carga, error y datos.
import { useState, useEffect } from 'react';

interface FetchDataResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useFetchData<T>(url: string, dependencies: any[] = []): FetchDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, error, loading };
}

// frontend/src/hooks/useNotifications.tsx
// Custom hook para manejar notificaciones en la aplicación.
// Este hook utiliza Material-UI y Framer Motion para mostrar notificaciones de manera elegante.
// El hook devuelve una función para mostrar notificaciones y un componente para renderizarlas.
import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export function useNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, severity: Notification['severity']) => {
    setNotification({ message, severity });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = () => (
    <AnimatePresence>
      {notification && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={clearNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert
              severity={notification.severity}
              onClose={clearNotification}
              sx={{ boxShadow: 6, borderRadius: '12px' }}
            >
              {notification.message}
            </Alert>
          </motion.div>
        </Snackbar>
      )}
    </AnimatePresence>
  );

  return { showNotification, NotificationComponent };
}

// frontend/src/lib/types.ts
// Tipos TypeScript para entidades y respuestas de la app

// src/lib/types.ts
export interface User {
  id: number;
  email: string;
  username: string;
  rol: string;
  activo: boolean;
  subscription: string;
  ciudad?: string;
  website?: string;
  credits: number;
  create_at: string;  // ISO string (e.g., "2023-10-01T12:00:00Z")
  last_ip?: string;
  last_login: string;
  user_type: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}



export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  ciudad?: string;
  website?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  username?: string;
  ciudad?: string;
  website?: string;
}

export interface PurchaseRequest {
  credits: number;
  payment_amount: number;
  payment_method?: string;
}

export interface PurchaseResponse {
  transaction_id: string;
  credits_added: number;
  new_balance: number;
}

export interface PaymentMethod {
  id: number;
  payment_type: string;
  details: string;
  is_default: boolean;
  created_at: string;  // ISO string
  updated_at: string;  // ISO string
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string; // ISO string
}

export interface Integration {
  user_id: number;
  id: number;
  name: string;
  webhook_url: string;
  event_type: string;
  active: boolean;
  created_at: string;
  last_triggered: string | null;
}

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    description?: string;
    tag?: string;
    updated_by?: number;
    updated_at: string; // ISO string
}

export interface FetchResponse<T> {
  data: T | null;
  error: string | HTTPValidationError | null;
  total_pages?: number;
}

// src/lib/types.ts
export interface UserInfo {
  user_id: string | null;
  email: string | null;
  username: string | null;
  user_type: string;
  subscription: string | null;
  credits: number;
  rol: string | null;
  session_id?: string;
  gamification: UserGamificationResponse[]; // Actualizado para reflejar /whoami
}

export interface EventType {
  id: number;
  name: string;
  description?: string;
  points_per_event: number;
}

export interface Badge {
  id: number;
  name: string;
  description?: string;
  event_type_id: number;
  required_points: number;
  user_type: string; // "anonymous", "registered", "both"
}

export interface Gamification {
  points: number;
  badges: Badge[];
}

export interface GamificationEventCreate {
  event_type_id: number;
}

export interface GamificationEventResponse {
  id: number;
  event_type_id: number;
  user_id?: number;
  session_id?: string;
  timestamp: string; // ISO string
}

export interface UserGamificationResponse {
  points: number;
  badge_id?: number;
  event_type_id: number;
  user_id?: number;
  session_id?: string;
  event_type: EventType;
  badge?: Badge;
}
export interface RankingResponse {
  username: string;
  points: number;
  badges_count: number;
  user_type: string;
}

export interface PaymentProvider {
  id: number;
  name: string;
  active: boolean;
}



export interface InfoResponse {
  credits: number;
  gamification: { points: number; badge: Badge | null }[];
}


export interface BadgeWithEventType extends Badge {
  event_type: EventType;
}


// src/lib/types.ts

// Nuevo tipo para cupones
export interface Coupon {
  id: number;
  name: string;
  description?: string;
  unique_identifier: string;
  issued_at: string; // ISO string
  expires_at?: string; // ISO string, opcional
  redeemed_at?: string; // ISO string, opcional
  active: boolean;
  status: "active" | "redeemed" | "expired" | "disabled";
  credits: number;
  user_id?: number; // Opcional, para usuarios registrados
  session_id?: string; // Opcional, para usuarios anónimos
  redeemed_by_user_id?: number; // Quién lo canjeó, si aplica
  redeemed_by_session_id?: string; // Quién lo canjeó (anónimo), si aplica
}



export interface CouponType {
  id: number;
  name: string;
  description?: string;
  credits: number;
  active: boolean;
}

export interface CouponActivity {
  id: number;
  coupon_type: string;
  unique_identifier: string;
  user_id?: number;
  session_id?: string;
  status: string;
  issued_at: string;
  redeemed_at?: string;
}

export interface AllowedOrigin {
  id: number;
  origin: string;
}

Tus cambios no deben afectar a la logica actual de la aplicación. 

Puedes crear nuevos endpoints, funciones, hooks, todo lo que necesites, siempre que no rompas la aplicación ni 
modifiques la logica principal, solo estas haciendo dos dashboard

crealos con la idea de reutilizar los componentes visuales o utilizar los ya creados para otros dashboard


Solicitame cualquier archivo que necesites o preguntame cualquier duda