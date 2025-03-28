from sqlalchemy.orm import Session
from core.database import SessionLocal, Base, engine
from models.site_settings import SiteSettings
from models.user import User, subscriptionEnum
from models.allowed_origin import AllowedOrigin
from models.credit_transaction import CreditTransaction
from models.error_log import ErrorLog
from models.integration import Integration
from models.api_log import APILog
from models.payment_method import PaymentMethod
from models.session import AnonymousSession
from models.token import RevokedToken, PasswordResetToken
from core.security import hash_password
from datetime import datetime, timedelta
import json
import uuid

def create_tables():
    """Crea todas las tablas en la base de datos"""
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")

def init_data():
    """Carga datos iniciales en todas las tablas"""
    db = SessionLocal()
    try:
        # Configuraciones iniciales del sitio
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

        db.flush()  # Para obtener los IDs de los usuarios

        # Orígenes permitidos adicionales
        origins_data = [
            {"origin": "https://thirdparty.com"},
            {"origin": "https://partner-app.com"},
            {"origin": "https://mobile-app.neptuno.app"}
        ]

        for origin_data in origins_data:
            if not db.query(AllowedOrigin).filter(AllowedOrigin.origin == origin_data["origin"]).first():
                db.add(AllowedOrigin(**origin_data))

        # Sesiones anónimas
        sessions_data = [
            {"id": str(uuid.uuid4()), "credits": 50, "create_at": datetime.utcnow(), "last_ip": "192.168.1.100"},
            {"id": str(uuid.uuid4()), "credits": 75, "create_at": datetime.utcnow() - timedelta(days=1), "last_ip": "10.0.0.15"},
            {"id": str(uuid.uuid4()), "credits": 100, "create_at": datetime.utcnow() - timedelta(hours=2), "last_ip": "172.16.0.5"}
        ]

        for session_data in sessions_data:
            if not db.query(AnonymousSession).filter(AnonymousSession.id == session_data["id"]).first():
                db.add(AnonymousSession(**session_data))

        # Transacciones de créditos
        credit_transactions = [
            {
                "user_id": users[0].id,
                "user_type": "registered",
                "amount": -10,
                "transaction_type": "api_call",
                "description": "Llamada a API de procesamiento",
                "timestamp": datetime.utcnow() - timedelta(hours=3)
            },
            {
                "user_id": users[1].id,
                "user_type": "registered",
                "amount": 100,
                "transaction_type": "purchase",
                "description": "Compra de créditos",
                "payment_amount": 9.99,
                "payment_method": "credit_card",
                "payment_status": "completed",
                "timestamp": datetime.utcnow() - timedelta(days=1)
            },
            {
                "session_id": sessions_data[0]["id"],
                "user_type": "anonymous",
                "amount": -5,
                "transaction_type": "api_call",
                "description": "Llamada a API de prueba",
                "timestamp": datetime.utcnow() - timedelta(hours=1)
            },
            {
                "user_id": users[2].id,
                "user_type": "registered",
                "amount": 5000,
                "transaction_type": "subscription_upgrade",
                "description": "Actualización a plan corporativo",
                "timestamp": datetime.utcnow() - timedelta(days=2)
            }
        ]

        for transaction in credit_transactions:
            db.add(CreditTransaction(**transaction))

        # Logs de errores
        error_logs = [
            {
                "user_id": users[0].id,
                "user_type": "registered",
                "error_code": 400,
                "message": "Invalid request parameters",
                "details": "Missing required field 'query'",
                "url": "/api/v1/process",
                "method": "POST",
                "ip_address": "192.168.1.1",
                "created_at": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "session_id": sessions_data[1]["id"],
                "user_type": "anonymous",
                "error_code": 403,
                "message": "Credit limit exceeded",
                "details": "User has insufficient credits for this operation",
                "url": "/api/v1/generate",
                "method": "POST",
                "ip_address": "10.0.0.15",
                "created_at": datetime.utcnow() - timedelta(days=1)
            },
            {
                "user_id": users[3].id,
                "user_type": "registered",
                "error_code": 500,
                "message": "Internal server error",
                "details": "Database connection timeout",
                "url": "/api/v1/admin/users",
                "method": "GET",
                "ip_address": "172.16.0.10",
                "created_at": datetime.utcnow() - timedelta(hours=5)
            }
        ]

        for error in error_logs:
            db.add(ErrorLog(**error))

        # Integraciones
        integrations = [
            {
                "user_id": users[1].id,
                "name": "slack",
                "webhook_url": "https://hooks.slack.com/services/T1234567/B1234567/XXXXXXXXXXXXXXXX",
                "event_type": "credit_usage",
                "active": True,
                "created_at": datetime.utcnow() - timedelta(days=10)
            },
            {
                "user_id": users[2].id,
                "name": "zapier",
                "webhook_url": "https://hooks.zapier.com/hooks/catch/1234567/abcdefg/",
                "event_type": "payment_added",
                "active": True,
                "created_at": datetime.utcnow() - timedelta(days=5)
            },
            {
                "user_id": users[3].id,
                "name": "crm_custom",
                "webhook_url": "https://crm.example.com/api/webhook/neptuno/123456",
                "event_type": "user_login",
                "active": False,
                "created_at": datetime.utcnow() - timedelta(days=3)
            }
        ]

        for integration in integrations:
            db.add(Integration(**integration))

        # Logs de API
        api_logs = [
            {
                "user_id": users[0].id,
                "endpoint": "/api/v1/process",
                "method": "POST",
                "status_code": 200,
                "request_data": json.dumps({"query": "sample text", "mode": "fast"}),
                "response_data": json.dumps({"result": "processed", "credits_used": 5}),
                "timestamp": datetime.utcnow() - timedelta(minutes=30)
            },
            {
                "user_id": None,
                "endpoint": "/api/v1/generate",
                "method": "POST",
                "status_code": 403,
                "request_data": json.dumps({"query": "another text"}),
                "response_data": json.dumps({"error": "Insufficient credits"}),
                "timestamp": datetime.utcnow() - timedelta(hours=1)
            },
            {
                "user_id": users[3].id,
                "endpoint": "/api/v1/admin/users",
                "method": "GET",
                "status_code": 200,
                "request_data": None,
                "response_data": json.dumps({"count": 6, "users": ["admin@example.com", "corporate@example.com"]}),
                "timestamp": datetime.utcnow() - timedelta(hours=2)
            }
        ]

        for log in api_logs:
            db.add(APILog(**log))

        # Métodos de pago
        payment_methods = [
            {
                "user_id": users[1].id,
                "payment_type": "credit_card",
                "details": "VISA ****4242",
                "is_default": True,
                "created_at": datetime.utcnow() - timedelta(days=30)
            },
            {
                "user_id": users[1].id,
                "payment_type": "paypal",
                "details": "user@example.com",
                "is_default": False,
                "created_at": datetime.utcnow() - timedelta(days=15)
            },
            {
                "user_id": users[2].id,
                "payment_type": "bank_transfer",
                "details": "ES12 3456 7890 1234 5678 9012",
                "is_default": True,
                "created_at": datetime.utcnow() - timedelta(days=20)
            }
        ]

        for method in payment_methods:
            db.add(PaymentMethod(**method))

        # Tokens revocados
        revoked_tokens = [
            {
                "token": "expired.token.123456",
                "revoked_at": datetime.utcnow() - timedelta(days=5),
                "user_id": users[0].id
            },
            {
                "token": "old.token.789012",
                "revoked_at": datetime.utcnow() - timedelta(days=10),
                "user_id": users[1].id
            }
        ]

        for token in revoked_tokens:
            db.add(RevokedToken(**token))

        # Tokens de reseteo de contraseña
        reset_tokens = [
            {
                "user_id": users[0].id,
                "token": "reset_token_123456",
                "created_at": datetime.utcnow(),
                "expires_at": datetime.utcnow() + timedelta(hours=1)
            },
            {
                "user_id": users[2].id,
                "token": "reset_token_789012",
                "created_at": datetime.utcnow() - timedelta(minutes=30),
                "expires_at": datetime.utcnow() + timedelta(minutes=30)
            }
        ]

        for token in reset_tokens:
            db.add(PasswordResetToken(**token))

        db.commit()
        print("Datos iniciales cargados exitosamente en todas las tablas.")
    except Exception as e:
        db.rollback()
        print(f"Error al cargar datos iniciales: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    init_data()