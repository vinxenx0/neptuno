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
        # Configuraciones iniciales
        settings_data = [
            {"key": "token_expiration", "value": 3600, "description": "Tiempo de vida del access token (segundos)"},
            {"key": "refresh_token_expiration", "value": 604800, "description": "Tiempo de vida del refresh token (7 días en segundos)"},
            {"key": "rate_limit_auth", "value": {"times": 20, "seconds": 60}, "description": "Límite de peticiones para endpoints de auth"},
            {"key": "rate_limit_api", "value": {"times": 100, "seconds": 60}, "description": "Límite de peticiones para endpoints de API"},
            {"key": "rate_limit_admin", "value": {"times": 50, "seconds": 60}, "description": "Límite de peticiones para endpoints de admin"},
            {"key": "cache_ttl", "value": 300, "description": "Tiempo de vida del caché en Redis (segundos)"},
            {"key": "cache_enabled", "value": True, "description": "Habilitar/deshabilitar el caché"},
            {"key": "allowed_origins", "value": ["http://localhost:3000"], "description": "Orígenes permitidos para CORS"},
            {"key": "celery_workers", "value": 4, "description": "Número de workers de Celery"},
            {"key": "celery_task_timeout", "value": 300, "description": "Tiempo máximo de ejecución de tareas Celery (segundos)"},
            {"key": "db_pool_size", "value": 20, "description": "Tamaño del pool de conexiones a la DB"},
            {"key": "db_max_overflow", "value": 10, "description": "Conexiones adicionales permitidas en el pool"},
            {"key": "db_pool_timeout", "value": 30, "description": "Tiempo de espera para una conexión del pool (segundos)"},
            {"key": "freemium_credits", "value": 100, "description": "Créditos iniciales para subscription freemium"},
            {"key": "premium_credits", "value": 1000, "description": "Créditos iniciales para subscription premium"},
            {"key": "credit_reset_interval", "value": 30, "description": "Intervalo de reinicio de créditos (días)"},
            {"key": "log_level", "value": "INFO", "description": "Nivel de logging"},
        ]

        for setting in settings_data:
            if not db.query(SiteSettings).filter(SiteSettings.key == setting["key"]).first():
                db.add(SiteSettings(
                    key=setting["key"],
                    value=json.dumps(setting["value"]),
                    description=setting["description"]
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
                "credits": 1000,  # Podríamos ajustarlo según el subscription
                "rol": "user",
                "create_at": datetime.utcnow(),
                "activo": True
            },
            {
                "email": "admin@example.com",
                "username": "admin_user",
                "password_hash": hash_password("admin123"),
                "subscription": subscriptionEnum.PREMIUM,  # Admin también puede tener un subscription
                "credits": 1000,
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