from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.site_settings import SiteSettings
from models.user import User, subscriptionEnum
from core.security import hash_password
from datetime import datetime
import json

def init_settings_and_users():
    db = SessionLocal()
    try:
        # Configuraciones iniciales con tags
        settings_data = [
            {"key": "token_expiration", "value": 3600, "description": "Tiempo de vida del access token (segundos)", "tag": "auth"},
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

        for user_data in users_data:
            if not db.query(User).filter(User.email == user_data["email"]).first():
                db.add(User(**user_data))

        db.commit()
        print("Configuraciones y usuarios iniciales cargados.")
    except Exception as e:
        db.rollback()
        print(f"Error al cargar datos iniciales: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    init_settings_and_users()