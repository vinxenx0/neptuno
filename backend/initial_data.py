#backend/initial_data.py
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from core.database import SessionLocal, Base, engine
from models.site_settings import SiteSettings
from models.user import User, subscriptionEnum
from models.allowed_origin import AllowedOrigin
from models.credit_transaction import CreditTransaction
from models.error_log import ErrorLog
from models.integration import Integration
from models.log import APILog
from models.payment_method import PaymentMethod
from models.session import AnonymousSession
from models.token import RevokedToken, PasswordResetToken
from core.security import hash_password
import json

def init_db():
    """Crea todas las tablas en la base de datos"""
    Base.metadata.create_all(bind=engine)

def init_settings_and_users():
    db = SessionLocal()
    try:
        # Configuraciones iniciales con tags
        settings_data = [
            {"key": "token_expiration", "value": 60, "description": "Tiempo de vida del access token (segundos)", "tag": "auth"},
            {"key": "refresh_token_expiration", "value": 604800, "description": "Tiempo de vida del refresh token (7 días)", "tag": "auth"},
            {"key": "max_login_attempts", "value": 5, "description": "Máximo de intentos de login antes de bloqueo", "tag": "auth"},
            {"key": "rate_limit_auth", "value": {"times": 20, "seconds": 60}, "description": "Límite de peticiones para auth", "tag": "rate_limit"},
            {"key": "rate_limit_api", "value": {"times": 100, "seconds": 60}, "description": "Límite de peticiones para API", "tag": "rate_limit"},
            {"key": "rate_limit_admin", "value": {"times": 50, "seconds": 60}, "description": "Límite de peticiones para admin", "tag": "rate_limit"},
            {"key": "cache_ttl", "value": 300, "description": "Tiempo de vida del caché en Redis (segundos)", "tag": "cache"},
            {"key": "cache_enabled", "value": True, "description": "Habilitar/deshabilitar el caché", "tag": "cache"},
            {"key": "cache_max_size", "value": 10000, "description": "Tamaño máximo del caché en entradas", "tag": "cache"},
            {"key": "allowed_origins", "value": ["http://localhost:3000", "https://neptuno.app"], "description": "Orígenes permitidos para CORS", "tag": "cors"},
            {"key": "cors_enabled", "value": True, "description": "Habilitar/deshabilitar CORS", "tag": "cors"},
            {"key": "celery_workers", "value": 4, "description": "Número de workers de Celery", "tag": "celery"},
            {"key": "celery_task_timeout", "value": 300, "description": "Tiempo máximo de ejecución de tareas Celery (segundos)", "tag": "celery"},
            {"key": "celery_max_retries", "value": 3, "description": "Máximo de reintentos para tareas Celery", "tag": "celery"},
            {"key": "db_pool_size", "value": 20, "description": "Tamaño del pool de conexiones a la DB", "tag": "database"},
            {"key": "db_max_overflow", "value": 10, "description": "Conexiones adicionales permitidas en el pool", "tag": "database"},
            {"key": "db_pool_timeout", "value": 30, "description": "Tiempo de espera para una conexión del pool (segundos)", "tag": "database"},
            {"key": "freemium_credits", "value": 100, "description": "Créditos iniciales para suscripción freemium", "tag": "credits"},
            {"key": "premium_credits", "value": 1000, "description": "Créditos iniciales para suscripción premium", "tag": "credits"},
            {"key": "corporate_credits", "value": 5000, "description": "Créditos iniciales para suscripción corporativa", "tag": "credits"},
            {"key": "credit_reset_interval", "value": 30, "description": "Intervalo de reinicio de créditos (días)", "tag": "credits"},
            {"key": "log_level", "value": "INFO", "description": "Nivel de logging", "tag": "logging"},
            {"key": "log_retention_days", "value": 90, "description": "Días de retención de logs", "tag": "logging"},
            {"key": "maintenance_mode", "value": False, "description": "Activar/desactivar modo mantenimiento", "tag": "system"},
            {"key": "api_version", "value": "1.0.0", "description": "Versión actual de la API", "tag": "system"},
        ]

        for setting in settings_data:
            if not db.query(SiteSettings).filter(SiteSettings.key == setting["key"]).first():
                db.add(SiteSettings(
                    key=setting["key"],
                    value=json.dumps(setting["value"]),
                    description=setting["description"],
                    tag=setting["tag"]
                ))

        # Usuarios iniciales
        users_data = [
            {
                "email": "freemium@example.com",
                "username": "freemium_user",
                "password_hash": hash_password("password123"),
                "subscription": subscriptionEnum.FREEMIUM,
                "credits": 100,
                "rol": "user",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "premium@example.com",
                "username": "premium_user",
                "password_hash": hash_password("password123"),
                "subscription": subscriptionEnum.PREMIUM,
                "credits": 1000,
                "rol": "user",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "corporate@example.com",
                "username": "corporate_user",
                "password_hash": hash_password("password123"),
                "subscription": subscriptionEnum.CORPORATE,
                "credits": 5000,
                "rol": "user",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "admin@example.com",
                "username": "admin_user",
                "password_hash": hash_password("admin123"),
                "subscription": subscriptionEnum.PREMIUM,
                "credits": 1000,
                "rol": "admin",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "testuser1@example.com",
                "username": "test_user1",
                "password_hash": hash_password("test123"),
                "subscription": subscriptionEnum.FREEMIUM,
                "credits": 100,
                "rol": "user",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "testadmin@example.com",
                "username": "test_admin",
                "password_hash": hash_password("admin456"),
                "subscription": subscriptionEnum.CORPORATE,
                "credits": 5000,
                "rol": "admin",
                "create_at": datetime.utcnow(),
                "activo": True
            }
        ]

        users = []
        for user_data in users_data:
            if not db.query(User).filter(User.email == user_data["email"]).first():
                user = User(**user_data)
                db.add(user)
                users.append(user)

        db.commit()  # Necesario para obtener los IDs de los usuarios

        # Orígenes permitidos
        origins = [
            "http://localhost:3000",
            "https://neptuno.app",
            "https://api.example.com",
            "https://app.example.com"
        ]
        
        for origin in origins:
            if not db.query(AllowedOrigin).filter(AllowedOrigin.origin == origin).first():
                db.add(AllowedOrigin(origin=origin))

        # Sesiones anónimas
        anonymous_sessions = []
        for i in range(3):
            session_id = str(uuid.uuid4())
            session = AnonymousSession(
                id=session_id,
                username=f"anon_user_{i+1}",
                credits=100 - (i * 10),
                create_at=datetime.utcnow() - timedelta(days=i),
                ultima_actividad=datetime.utcnow() - timedelta(hours=i),
                last_ip=f"192.168.1.{i+1}"
            )
            db.add(session)
            anonymous_sessions.append(session)

        # Transacciones de créditos
        transactions = [
            # Transacciones para usuarios registrados
            {
                "user_id": users[0].id,
                "user_type": "registered",
                "amount": -10,
                "transaction_type": "api_call",
                "description": "Llamada a API de procesamiento"
            },
            {
                "user_id": users[1].id,
                "user_type": "registered",
                "amount": 500,
                "transaction_type": "purchase",
                "description": "Compra de créditos",
                "payment_amount": 9.99,
                "payment_method": "credit_card",
                "payment_status": "completed"
            },
            # Transacciones para sesiones anónimas
            {
                "session_id": anonymous_sessions[0].id,
                "user_type": "anonymous",
                "amount": -5,
                "transaction_type": "api_call",
                "description": "Llamada a API demo"
            },
            {
                "session_id": anonymous_sessions[1].id,
                "user_type": "anonymous",
                "amount": -15,
                "transaction_type": "api_call",
                "description": "Procesamiento de datos"
            }
        ]

        for transaction in transactions:
            db.add(CreditTransaction(**transaction))

        # Logs de errores
        error_logs = [
            {
                "user_id": users[0].id,
                "user_type": "registered",
                "error_code": 400,
                "message": "Invalid request parameters",
                "details": "Missing required field 'email'",
                "url": "/api/v1/users",
                "method": "POST",
                "ip_address": "192.168.1.100"
            },
            {
                "session_id": anonymous_sessions[0].id,
                "user_type": "anonymous",
                "error_code": 429,
                "message": "Rate limit exceeded",
                "details": "Too many requests from this IP",
                "url": "/api/v1/process",
                "method": "POST",
                "ip_address": "192.168.1.101"
            },
            {
                "user_id": users[2].id,
                "user_type": "registered",
                "error_code": 500,
                "message": "Internal server error",
                "details": "Database connection timeout",
                "url": "/api/v1/credits",
                "method": "GET",
                "ip_address": "192.168.1.102"
            }
        ]

        for error in error_logs:
            db.add(ErrorLog(**error))

        # Integraciones
        integrations = [
            {
                "user_id": users[1].id,
                "name": "slack",
                "webhook_url": "https://hooks.slack.com/services/TXXXXX/BXXXXX/XXXXX",
                "event_type": "credit_usage",
                "active": True,
                "last_triggered": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "user_id": users[3].id,
                "name": "zapier",
                "webhook_url": "https://hooks.zapier.com/hooks/catch/XXXXX/XXXXX",
                "event_type": "user_login",
                "active": True
            },
            {
                "user_id": users[2].id,
                "name": "crm_custom",
                "webhook_url": "https://api.crm.com/webhook/XXXXX",
                "event_type": "payment_added",
                "active": False
            }
        ]

        for integration in integrations:
            db.add(Integration(**integration))

        # Logs de API
        api_logs = [
            {
                "user_id": users[0].id,
                "endpoint": "/api/v1/auth/login",
                "method": "POST",
                "status_code": 200,
                "request_data": json.dumps({"email": "user@example.com", "password": "****"}),
                "response_data": json.dumps({"token": "xxxx.yyyy.zzzz"})
            },
            {
                "endpoint": "/api/v1/process",
                "method": "POST",
                "status_code": 201,
                "request_data": json.dumps({"data": "sample data"}),
                "response_data": json.dumps({"result": "processed", "credits_used": 5})
            },
            {
                "user_id": users[3].id,
                "endpoint": "/api/v1/admin/users",
                "method": "GET",
                "status_code": 200,
                "response_data": json.dumps({"count": 42, "users": []})
            }
        ]

        for log in api_logs:
            db.add(APILog(**log))

        # Métodos de pago
        payment_methods = [
            {
                "user_id": users[1].id,
                "payment_type": "credit_card",
                "details": "VISA ending in 4242",
                "is_default": True
            },
            {
                "user_id": users[1].id,
                "payment_type": "paypal",
                "details": "user@example.com",
                "is_default": False
            },
            {
                "user_id": users[2].id,
                "payment_type": "bank_transfer",
                "details": "IBAN: ESXX XXXX XXXX XXXX XXXX",
                "is_default": True
            }
        ]

        for method in payment_methods:
            db.add(PaymentMethod(**method))

        # Tokens revocados
        revoked_tokens = [
            {"token": "expired.token.xxxx", "revoked_at": datetime.utcnow() - timedelta(days=30), "user_id": users[0].id},
            {"token": "compromised.token.yyyy", "revoked_at": datetime.utcnow() - timedelta(hours=2), "user_id": users[1].id}
        ]

        for token in revoked_tokens:
            db.add(RevokedToken(**token))

        # Tokens de reseteo de contraseña
        reset_tokens = [
            {
                "user_id": users[0].id,
                "token": "reset_token_123",
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            },
            {
                "user_id": users[3].id,
                "token": "reset_token_456",
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            }
        ]

        for token in reset_tokens:
            db.add(PasswordResetToken(**token))

        db.commit()
        print("✅ Base de datos inicializada con datos de ejemplo en todas las tablas.")
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