import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker
from core.database import SessionLocal, Base, engine
from models.site_settings import SiteSettings
from models.user import User, subscriptionEnum
from models.allowed_origin import AllowedOrigin
from models.credit_transaction import CreditTransaction
from models.error_log import ErrorLog
from models.integration import Integration
from models.log import APILog
from models.payment_method import PaymentMethod
from models.gamification import EventType, Badge, GamificationEvent, UserGamification
from models.guests import GuestsSession
from models.token import RevokedToken, PasswordResetToken
from models.coupon import Coupon
from models.coupon_type import CouponType
from models.payment_provider import PaymentProvider
from core.security import hash_password
import json


def init_db():
    """Crea todas las tablas en la base de datos"""
    Base.metadata.create_all(bind=engine)


def init_settings_and_users():
    """Pobla la base de datos con datos iniciales si está vacía."""
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        # Verificar si la base de datos ya tiene datos
        if db.query(User).first():
            print(
                "La base de datos ya está poblada. No se realizarán cambios.")
            return

        # Configuraciones iniciales en site_settings
        settings_data = [
            {
                "key": "token_expiration",
                "value": 3600,
                "description": "Tiempo de vida del access token (segundos)",
                "tag": "auth"
            },
            {
                "key": "refresh_token_expiration",
                "value": 604800,
                "description": "Tiempo de vida del refresh token (7 días)",
                "tag": "auth"
            },
            {
                "key": "max_login_attempts",
                "value": 5,
                "description": "Máximo de intentos de login antes de bloqueo",
                "tag": "auth"
            },
            {
                "key": "rate_limit_auth",
                "value": {
                    "times": 20,
                    "seconds": 60
                },
                "description": "Límite de peticiones para auth",
                "tag": "rate_limit"
            },
            {
                "key": "rate_limit_api",
                "value": {
                    "times": 100,
                    "seconds": 60
                },
                "description": "Límite de peticiones para API",
                "tag": "rate_limit"
            },
            {
                "key": "rate_limit_admin",
                "value": {
                    "times": 50,
                    "seconds": 60
                },
                "description": "Límite de peticiones para admin",
                "tag": "rate_limit"
            },
            {
                "key": "cache_ttl",
                "value": 300,
                "description": "Tiempo de vida del caché en Redis (segundos)",
                "tag": "cache"
            },
            {
                "key": "cache_enabled",
                "value": True,
                "description": "Habilitar/deshabilitar el caché",
                "tag": "cache"
            },
            {
                "key": "cache_max_size",
                "value": 10000,
                "description": "Tamaño máximo del caché en entradas",
                "tag": "cache"
            },
            {
                "key": "allowed_origins",
                "value": True,
                "description":
                "Activar/desactivar orígenes permitidos para CORS",
                "tag": "cors"
            },
            {
                "key": "cors_enabled",
                "value": True,
                "description": "Habilitar/deshabilitar CORS",
                "tag": "cors"
            },
            {
                "key": "celery_workers",
                "value": 4,
                "description": "Número de workers de Celery",
                "tag": "celery"
            },
            {
                "key": "celery_task_timeout",
                "value": 300,
                "description":
                "Tiempo máximo de ejecución de tareas Celery (segundos)",
                "tag": "celery"
            },
            {
                "key": "celery_max_retries",
                "value": 3,
                "description": "Máximo de reintentos para tareas Celery",
                "tag": "celery"
            },
            {
                "key": "db_pool_size",
                "value": 20,
                "description": "Tamaño del pool de conexiones a la DB",
                "tag": "database"
            },
            {
                "key": "db_max_overflow",
                "value": 10,
                "description": "Conexiones adicionales permitidas en el pool",
                "tag": "database"
            },
            {
                "key": "db_pool_timeout",
                "value": 30,
                "description":
                "Tiempo de espera para una conexión del pool (segundos)",
                "tag": "database"
            },
            {
                "key": "freemium_credits",
                "value": 100,
                "description": "Créditos iniciales para suscripción freemium",
                "tag": "credits"
            },
            {
                "key": "premium_credits",
                "value": 1000,
                "description": "Créditos iniciales para suscripción premium",
                "tag": "credits"
            },
            {
                "key": "corporate_credits",
                "value": 5000,
                "description":
                "Créditos iniciales para suscripción corporativa",
                "tag": "credits"
            },
            {
                "key": "credit_reset_interval",
                "value": 30,
                "description": "Intervalo de reinicio de créditos (días)",
                "tag": "credits"
            },
            {
                "key": "log_level",
                "value": "INFO",
                "description": "Nivel de logging",
                "tag": "logging"
            },
            {
                "key": "log_retention_days",
                "value": 90,
                "description": "Días de retención de logs",
                "tag": "logging"
            },
            {
                "key": "maintenance_mode",
                "value": False,
                "description": "Activar/desactivar modo mantenimiento",
                "tag": "system"
            },
            {
                "key": "api_version",
                "value": "1.0.0",
                "description": "Versión actual de la API",
                "tag": "system"
            },
            {
                "key": "enable_registration",
                "value": True,
                "description": "Activar/desactivar registro de usuarios",
                "tag": "features"
            },
            {
                "key": "enable_social_login",
                "value": True,
                "description": "Activar/desactivar login social",
                "tag": "features"
            },
            {
                "key": "disable_anonymous_users",
                "value": False,
                "description": "Desactivar usuarios anónimos",
                "tag": "features"
            },
            {
                "key": "disable_credits",
                "value": False,
                "description": "Desactivar sistema de créditos",
                "tag": "features"
            },
            {
                "key": "enable_payment_methods",
                "value": True,
                "description": "Activar métodos de pago",
                "tag": "features"
            },
            {
                "key": "enable_points",
                "value": True,
                "description": "Activar sistema de puntos",
                "tag": "features"
            },
            {
                "key": "enable_badges",
                "value": True,
                "description": "Activar insignias",
                "tag": "features"
            },
            {
                "key": "enable_coupons",
                "value": True,
                "description": "Activar cupones",
                "tag": "features"
            },
        ]

        for setting in settings_data:
            if not db.query(SiteSettings).filter(
                    SiteSettings.key == setting["key"]).first():
                db.add(
                    SiteSettings(key=setting["key"],
                                 value=json.dumps(setting["value"]),
                                 description=setting["description"],
                                 tag=setting["tag"]))

        # Usuarios iniciales
        users_data = [{
            "email": "admin@example.com",
            "username": "admin_user1",
            "password_hash": hash_password("admin123"),
            "subscription": subscriptionEnum.PREMIUM,
            "credits": 1000,
            "rol": "admin",
            "create_at": datetime.utcnow() - timedelta(days=40),
            "activo": True
        }, {
            "email": "user@example.com",
            "username": "user",
            "password_hash": hash_password("user123"),
            "subscription": subscriptionEnum.CORPORATE,
            "credits": 5000,
            "rol": "user",
            "create_at": datetime.utcnow() - timedelta(days=35),
            "activo": True
        }]

        users = []
        for user_data in users_data:
            if not db.query(User).filter(
                    User.email == user_data["email"]).first():
                user = User(**user_data)
                db.add(user)
                users.append(user)

        db.commit()  # Necesario para obtener los IDs de los usuarios

        # Orígenes permitidos
        origins = [
            "http://localhost:3000", "https://neptuno.app",
            "https://staging.neptuno.app", "https://api.neptuno.app",
            "https://admin.neptuno.app"
        ]
        for origin in origins:
            if not db.query(AllowedOrigin).filter(
                    AllowedOrigin.origin == origin).first():
                db.add(AllowedOrigin(origin=origin))

        # Sesiones anónimas
        anonymous_sessions = []
        for i in range(2):
            session_id = str(uuid.uuid4())
            session = GuestsSession(
                id=session_id,
                username=f"anon_user_{i+1}",
                credits=100 - (i * 15),
                create_at=datetime.utcnow() - timedelta(days=i * 2),
                ultima_actividad=datetime.utcnow() - timedelta(hours=i),
                last_ip=f"192.168.1.{100 + i}")
            db.add(session)
            anonymous_sessions.append(session)

        # Proveedores de pago
        payment_providers = [{
            "name": "STRIPE",
            "active": True
        }, {
            "name": "PayPal",
            "active": True
        }, {
            "name": "Transferencia bancaria",
            "active": False
        }, {
            "name": "Crypto",
            "active": True
        }]
        for provider in payment_providers:
            if not db.query(PaymentProvider).filter(
                    PaymentProvider.name == provider["name"]).first():
                db.add(PaymentProvider(**provider))

        # Transacciones de créditos
        transactions = [{
            "user_id": users[0].id,
            "user_type": "registered",
            "amount": -10,
            "transaction_type": "api_call",
            "description": "Llamada a API"
        }]

        for transaction in transactions:
            db.add(CreditTransaction(**transaction))

        # Logs de errores
        error_logs = [{
            "user_id": users[0].id,
            "user_type": "registered",
            "error_code": 400,
            "message": "Invalid request",
            "details": "Missing 'email'",
            "url": "/api/v1/users",
            "method": "POST",
            "ip_address": "192.168.1.100"
        }, {
            "session_id": anonymous_sessions[0].id,
            "user_type": "anonymous",
            "error_code": 429,
            "message": "Rate limit exceeded",
            "details": "Too many requests",
            "url": "/api/v1/process",
            "method": "POST",
            "ip_address": "192.168.1.101"
        }]

        for error in error_logs:
            db.add(ErrorLog(**error))

        # Integraciones
        integrations = [{
            "user_id":
            users[0].id,
            "name":
            "slack_notif",
            "webhook_url":
            "https://hooks.slack.com/services/XXX",
            "event_type":
            "credit_usage",
            "active":
            True,
            "last_triggered":
            datetime.utcnow() - timedelta(hours=1)
        }]

        for integration in integrations:
            db.add(Integration(**integration))

        # Logs de API
        api_logs = [{
            "user_id":
            users[0].id,
            "endpoint":
            "/api/v1/auth/login",
            "method":
            "POST",
            "status_code":
            200,
            "request_data":
            json.dumps({"email": "freemium1@example.com"}),
            "response_data":
            json.dumps({"token": "xxx.yyy.zzz"})
        }]

        for log in api_logs:
            db.add(APILog(**log))

        # Métodos de pago
        payment_methods = [{
            "user_id": users[0].id,
            "payment_type": "credit_card",
            "details": "VISA ending in 4242",
            "is_default": True
        }]
        for method in payment_methods:
            db.add(PaymentMethod(**method))

        # Tokens revocados
        revoked_tokens = [{
            "token": "expired.token.xxx",
            "revoked_at": datetime.utcnow() - timedelta(days=10),
            "user_id": users[0].id
        }]
        for token in revoked_tokens:
            db.add(RevokedToken(**token))

        # Tokens de reseteo de contraseña
        reset_tokens = [{
            "user_id": users[0].id,
            "token": "reset_abc123",
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }]
        for token in reset_tokens:
            db.add(PasswordResetToken(**token))

        # Tipos de cupones
        coupon_types = [{
            "name": "Bienvenida",
            "description": "Cupón para nuevos usuarios",
            "credits": 50,
            "active": True
        }, {
            "name": "FIDELIDAD",
            "description": "Cupón por lealtad",
            "credits": 100,
            "active": True
        }, {
            "name": "PROMOCION",
            "description": "Cupón promocional especial",
            "credits": 200,
            "active": True
        }, {
            "name": "EVENTO",
            "description": "Cupón para eventos",
            "credits": 75,
            "active": False
        }]
        coupon_type_objects = []
        for ct in coupon_types:
            if not db.query(CouponType).filter(
                    CouponType.name == ct["name"]).first():
                coupon_type = CouponType(**ct)
                db.add(coupon_type)
                coupon_type_objects.append(coupon_type)
        db.commit()

        # Cupones
        coupons = [{
            "coupon_type_id": coupon_type_objects[0].id,
            "unique_identifier": str(uuid.uuid4()),
            "name": str(uuid.uuid4()),
            "issued_at": datetime.utcnow() - timedelta(days=5),
            "expires_at": datetime.utcnow() + timedelta(days=25),
            "active": True,
            "status": "active",
            "user_id": users[0].id,
            "session_id": anonymous_sessions[0].id,
            "credits": 50
        }]
        for coupon in coupons:
            db.add(Coupon(**coupon))

        # Eventos de gamificación
        event_types = [{
            "name": "api_usage",
            "description": "Uso de la API",
            "points_per_event": 10
        }, {
            "name": "login",
            "description": "Inicio de sesión",
            "points_per_event": 5
        }, {
            "name": "purchase",
            "description": "Compra de créditos",
            "points_per_event": 50
        }, {
            "name": "error_report",
            "description": "Reporte de error",
            "points_per_event": 20
        }]
        event_type_objects = []
        for event in event_types:
            if not db.query(EventType).filter(
                    EventType.name == event["name"]).first():
                event_type = EventType(**event)
                db.add(event_type)
                event_type_objects.append(event_type)
        db.commit()

        # Insignias
        badges = [{
            "name": "Novato",
            "description": "Primer uso de API",
            "event_type_id": event_type_objects[0].id,
            "required_points": 10,
            "user_type": "both"
        }, {
            "name": "Experto",
            "description": "100 usos de API",
            "event_type_id": event_type_objects[0].id,
            "required_points": 100,
            "user_type": "both"
        }, {
            "name": "Comprador",
            "description": "Primera compra",
            "event_type_id": event_type_objects[2].id,
            "required_points": 50,
            "user_type": "registered"
        }, {
            "name": "Solucionador",
            "description": "Reporte de errores",
            "event_type_id": event_type_objects[3].id,
            "required_points": 40,
            "user_type": "registered"
        }]
        badge_objects = []
        for badge in badges:
            if not db.query(Badge).filter(Badge.name == badge["name"]).first():
                badge_obj = Badge(**badge)
                db.add(badge_obj)
                badge_objects.append(badge_obj)
        db.commit()

        # Eventos de gamificación
        gamification_events = [{
            "event_type_id":
            event_type_objects[0].id,
            "user_id":
            users[0].id,
            "timestamp":
            datetime.utcnow() - timedelta(days=1)
        }]
        for event in gamification_events:
            db.add(GamificationEvent(**event))

        # Puntos de gamificación de usuarios
        user_gamification_data = [{
            "user_id": users[0].id,
            "event_type_id": event_type_objects[0].id,
            "points": 10,
            "badge_id": badge_objects[0].id
        }]
        for ug in user_gamification_data:
            db.add(UserGamification(**ug))

        db.commit()
        print(
            "✅ Base de datos inicializada con datos de ejemplo en todas las tablas."
        )
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar datos iniciales: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Creando tablas en la base de datos...")
    init_db()
    print("Cargando datos iniciales...")
    init_settings_and_users()
