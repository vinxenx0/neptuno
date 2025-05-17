# backend/core/config.py
# Módulo de configuración de la aplicación.

from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    
    # Configuración de FastAPI
    PROJECT_NAME = "Neptuno"
    SECRET_KEY = os.getenv("SECRET_KEY")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")  # "development" o "production"
    
    # Configuración de bases de datos
    SQLITE_URL = os.getenv("SQLITE_URL","sqlite:///dev.db")  # SQLite en desarrollo
    MYSQL_URL = os.getenv("MYSQL_URL")  # MySQL en producción (definido en .env)
 
    # Configuracion de Correo
    EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "smtp")

    # SMTP config
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")

    # SendGrid
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@miapp.com")
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Mi App")
    
    # Mailgun
    MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
    MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")

    # AWS SES
    AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
    AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
    AWS_REGION = os.getenv("AWS_REGION")


    
    @property
    def DATABASE_URL(self):
        return self.SQLITE_URL if self.ENVIRONMENT == "development" else self.MYSQL_URL
    
       
    # # Configuración de CORS
    # CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")  # Permitir todos los orígenes por defecto
    # CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    # CORS_ALLOW_METHODS = os.getenv("CORS_ALLOW_METHODS", "GET, POST, PUT, DELETE, OPTIONS")
    # CORS_ALLOW_HEADERS = os.getenv("CORS_ALLOW_HEADERS", "Content-Type, Authorization")
    # CORS_EXPOSE_HEADERS = os.getenv("CORS_EXPOSE_HEADERS", "Content-Type, Authorization")
    # CORS_MAX_AGE = int(os.getenv("CORS_MAX_AGE", 3600))  # 1 hora por defecto
    
    # # Configuración de seguridad
    # SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "my_precious_two")
    # JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "my_precious_two")
    # JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    # JWT_EXPIRATION_DELTA = int(os.getenv("JWT_EXPIRATION_DELTA", 3600))  # 1 hora por defecto
    # JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "myapp")  
    
    # # Configuración de autenticación
    # AUTH_BACKEND = os.getenv("AUTH_BACKEND", "jwt")  # "jwt" o "oauth2"
    # AUTH_OAUTH2_CLIENT_ID = os.getenv("AUTH_OAUTH2_CLIENT_ID")
    # AUTH_OAUTH2_CLIENT_SECRET = os.getenv("AUTH_OAUTH2_CLIENT_SECRET")
    # AUTH_OAUTH2_REDIRECT_URI = os.getenv("AUTH_OAUTH2_REDIRECT_URI")
    # AUTH_OAUTH2_SCOPE = os.getenv("AUTH_OAUTH2_SCOPE", "openid email profile")
    # AUTH_OAUTH2_PROVIDER = os.getenv("AUTH_OAUTH2_PROVIDER", "google")  # "google", "facebook", etc.
    # AUTH_OAUTH2_TOKEN_URL = os.getenv("AUTH_OAUTH2_TOKEN_URL")
    # AUTH_OAUTH2_USERINFO_URL = os.getenv("AUTH_OAUTH2_USERINFO_URL")
    # AUTH_OAUTH2_AUTH_URL = os.getenv("AUTH_OAUTH2_AUTH_URL")
    # AUTH_OAUTH2_LOGOUT_URL = os.getenv("AUTH_OAUTH2_LOGOUT_URL")
    # AUTH_OAUTH2_LOGOUT_REDIRECT_URL = os.getenv("AUTH_OAUTH2_LOGOUT_REDIRECT_URL")
    # AUTH_OAUTH2_LOGOUT_POST_LOGOUT_REDIRECT_URL = os.getenv("AUTH_OAUTH2_LOGOUT_POST_LOGOUT_REDIRECT_URL")
    # AUTH_OAUTH2_LOGOUT_CLIENT_ID = os.getenv("AUTH_OAUTH2_LOGOUT_CLIENT_ID")
    # AUTH_OAUTH2_LOGOUT_CLIENT_SECRET = os.getenv("AUTH_OAUTH2_LOGOUT_CLIENT_SECRET")
    # AUTH_OAUTH2_LOGOUT_SCOPE = os.getenv("AUTH_OAUTH2_LOGOUT_SCOPE", "openid email profile")
    # AUTH_OAUTH2_LOGOUT_RESPONSE_TYPE = os.getenv("AUTH_OAUTH2_LOGOUT_RESPONSE_TYPE", "code")
    # AUTH_OAUTH2_LOGOUT_GRANT_TYPE = os.getenv("AUTH_OAUTH2_LOGOUT_GRANT_TYPE", "authorization_code")
    # AUTH_OAUTH2_LOGOUT_TOKEN_URL = os.getenv("AUTH_OAUTH2_LOGOUT_TOKEN_URL")
    # AUTH_OAUTH2_LOGOUT_USERINFO_URL = os.getenv("AUTH_OAUTH2_LOGOUT_USERINFO_URL")
    # AUTH_OAUTH2_LOGOUT_AUTH_URL = os.getenv("AUTH_OAUTH2_LOGOUT_AUTH_URL")
    
    # # Configuración de logging
    # LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")  # "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"
    # LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    # LOG_FILE = os.getenv("LOG_FILE", "app.log")  # Archivo de log por defecto
    # LOG_MAX_BYTES = int(os.getenv("LOG_MAX_BYTES", 10485760))  # 10 MB por defecto
    # LOG_BACKUP_COUNT = int(os.getenv("LOG_BACKUP_COUNT", 5))  # 5 archivos de backup por defecto
    # LOG_COMPRESSION = os.getenv("LOG_COMPRESSION", "zip")  # "zip" o "tar"
    # LOG_ROTATION = os.getenv("LOG_ROTATION", "midnight")  # "midnight" o "size"
    # LOG_BACKUP_COUNT = int(os.getenv("LOG_BACKUP_COUNT", 5))  # 5 archivos de backup por defecto
    # LOG_FORMATTER = os.getenv("LOG_FORMATTER", "json")  # "json" o "text"
    # LOG_FILTER = os.getenv("LOG_FILTER", "default")  # "default" o "custom"
    # LOG_FILTER_ARGS = os.getenv("LOG_FILTER_ARGS", "")  # Argumentos para el filtro de logs
    # LOG_FILTER_KWARGS = os.getenv("LOG_FILTER_KWARGS", "")  # Argumentos para el filtro de logs
    # LOG_FILTER_LEVEL = os.getenv("LOG_FILTER_LEVEL", "INFO")  # Nivel de filtro de logs
    # LOG_FILTER_NAME = os.getenv("LOG_FILTER_NAME", "default")  # Nombre del filtro de logs
    # LOG_FILTER_MODULE = os.getenv("LOG_FILTER_MODULE", "default")  # Módulo del filtro de logs
    # LOG_FILTER_FUNC = os.getenv("LOG_FILTER_FUNC", "default")  # Función del filtro de logs
    # LOG_FILTER_PATH = os.getenv("LOG_FILTER_PATH", "default")  # Ruta del filtro de logs
    # LOG_FILTER_LINE = os.getenv("LOG_FILTER_LINE", "default")  # Línea del filtro de logs
    # LOG_FILTER_FUNC_NAME = os.getenv("LOG_FILTER_FUNC_NAME", "default")  # Nombre de la función del filtro de logs

    # # Configuración de Redis
    # REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")  # URL de Redis por defecto
    # REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    # REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))  # Puerto de Redis por defecto
    # REDIS_DB = int(os.getenv("REDIS_DB", 0))  # Base de datos de Redis por defecto
    # REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")  # Contraseña de Redis (si es necesario)
    # REDIS_SSL = os.getenv("REDIS_SSL", "false").lower() == "true"  # SSL para Redis por defecto
    # REDIS_SSL_CERT = os.getenv("REDIS_SSL_CERT")  # Certificado SSL para Redis (si es necesario)
    # REDIS_SSL_KEY = os.getenv("REDIS_SSL_KEY")  # Clave SSL para Redis (si es necesario)
    # REDIS_SSL_CA = os.getenv("REDIS_SSL_CA")  # CA SSL para Redis (si es necesario)
    # REDIS_SSL_CERT_REDIS = os.getenv("REDIS_SSL_CERT_REDIS")  # Certificado SSL para Redis (si es necesario)
    # REDIS_SSL_KEY_REDIS = os.getenv("REDIS_SSL_KEY_REDIS")  # Clave SSL para Redis (si es necesario)
    # REDIS_SSL_CA_REDIS = os.getenv("REDIS_SSL_CA_REDIS")  # CA SSL para Redis (si es necesario)
    
    
    # # Configuración de Sentry
    # SENTRY_DSN = os.getenv("SENTRY_DSN")  # DSN de Sentry (si es necesario)
    # SENTRY_ENVIRONMENT = os.getenv("SENTRY_ENVIRONMENT", "production")  # Entorno de Sentry por defecto
    # SENTRY_RELEASE = os.getenv("SENTRY_RELEASE")  # Release de Sentry (si es necesario)
    
    # # Configuración de Stripe
    # STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")  # Clave API de Stripe (si es necesario)
    # STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")  # Secreto del webhook de Stripe (si es necesario)
    # STRIPE_WEBHOOK_URL = os.getenv("STRIPE_WEBHOOK_URL")  # URL del webhook de Stripe (si es necesario)
    # STRIPE_WEBHOOK_ENABLED = os.getenv("STRIPE_WEBHOOK_ENABLED", "false").lower() == "true"  # Habilitar webhook de Stripe por defecto
    # STRIPE_WEBHOOK_VERIFIED = os.getenv("STRIPE_WEBHOOK_VERIFIED", "false").lower() == "true"  # Verificar webhook de Stripe por defecto
    # STRIPE_WEBHOOK_VERIFIED_URL = os.getenv("STRIPE_WEBHOOK_VERIFIED_URL")  # URL verificada del webhook de Stripe (si es necesario)
    # STRIPE_WEBHOOK_VERIFIED_SECRET = os.getenv("STRIPE_WEBHOOK_VERIFIED_SECRET")  # Secreto verificado
    
    # # Configuración de Twilio
    # TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")  # SID de la cuenta de Twilio (si es necesario)
    # TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")  # Token de autenticación de Twilio (si es necesario)
    # TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")  # Número de teléfono de Twilio (si es necesario)
    # TWILIO_API_KEY = os.getenv("TWILIO_API_KEY")  # Clave API de Twilio (si es necesario)
    # TWILIO_API_SECRET = os.getenv("TWILIO_API_SECRET")  # Secreto API de Twilio (si es necesario)
    # TWILIO_API_VERSION = os.getenv("TWILIO_API_VERSION", "2010-04-01")  # Versión de la API de Twilio por defecto
    # TWILIO_SMS_ENABLED = os.getenv("TWILIO_SMS_ENABLED", "false").lower() == "true"  # Habilitar SMS de Twilio por defecto
    # TWILIO_SMS_VERIFIED = os.getenv("TWILIO_SMS_VERIFIED", "false").lower() == "true"  # Verificar SMS de Twilio por defecto
    # TWILIO_SMS_VERIFIED_URL = os.getenv("TWILIO_SMS_VERIFIED_URL")  # URL verificada del SMS de Twilio (si es necesario)
    # TWILIO_SMS_VERIFIED_SECRET = os.getenv("TWILIO_SMS_VERIFIED_SECRET")  # Secreto verificado del SMS de Twilio (si es necesario)
    
    # # Configuración de AWS
    # AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")  # Clave de acceso de AWS (si es necesario)
    # AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")  # Clave secreta de AWS (si es necesario)
    # AWS_REGION = os.getenv("AWS_REGION", "us-east-1")  # Región de AWS por defecto
    # AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")  # Nombre del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_REGION = os.getenv("AWS_S3_BUCKET_REGION", "us-east-1")  # Región del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL = os.getenv("AWS_S3_BUCKET_URL")  # URL del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_ACCESS_KEY = os.getenv("AWS_S3_BUCKET_ACCESS_KEY")  # Clave de acceso del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_SECRET_KEY = os.getenv("AWS_S3_BUCKET_SECRET_KEY")  # Clave secreta del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_ENDPOINT = os.getenv("AWS_S3_BUCKET_ENDPOINT")  # Endpoint del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_REGION_NAME = os.getenv("AWS_S3_BUCKET_REGION_NAME")  # Nombre de la región del bucket de S3 de AWS (si es necesario)
    # AWS_S3_BUCKET_URL_EXPIRATION = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION", 3600))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_SECONDS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_SECONDS", 3600))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_MINUTES = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_MINUTES", 60))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_HOURS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_HOURS", 24))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_DAYS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_DAYS", 30))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_WEEKS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_WEEKS", 7))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_MONTHS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_MONTHS", 1))  # Expiración de la URL del bucket de S3 de AWS por defecto
    # AWS_S3_BUCKET_URL_EXPIRATION_YEARS = int(os.getenv("AWS_S3_BUCKET_URL_EXPIRATION_YEARS", 1))  # Expiración de la URL del bucket de S3 de AWS por defecto
    
    # # Configuración de Celery
    # CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")  # URL del broker de Celery por defecto
    # CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")  # Backend de resultados de Celery por defecto
    # CELERY_ACCEPT_CONTENT = os.getenv("CELERY_ACCEPT_CONTENT", "json")  # Contenido aceptado por Celery por defecto
    # CELERY_TASK_SERIALIZER = os.getenv("CELERY_TASK_SERIALIZER", "json")  # Serializador de tareas de Celery por defecto
    # CELERY_RESULT_SERIALIZER = os.getenv("CELERY_RESULT_SERIALIZER", "json")  # Serializador de resultados de Celery por defecto
    # CELERY_TIMEZONE = os.getenv("CELERY_TIMEZONE", "UTC")  # Zona horaria de Celery por defecto
    # CELERY_ENABLE_UTC = os.getenv("CELERY_ENABLE_UTC", "true").lower() == "true"  # Habilitar UTC en Celery por defecto
    # CELERY_TASK_TRACK_STARTED = os.getenv("CELERY_TASK_TRACK_STARTED", "true").lower() == "true"  # Habilitar seguimiento de tareas iniciadas en Celery por defecto
    # CELERY_TASK_TRACK_SCHEDULED = os.getenv("CELERY_TASK_TRACK_SCHEDULED", "true").lower() == "true"  # Habilitar seguimiento de tareas programadas en Celery por defecto
    # CELERY_TASK_TRACK_REVOKED = os.getenv("CELERY_TASK_TRACK_REVOKED", "true").lower() == "true"  # Habilitar seguimiento de tareas revocadas en Celery por defecto
    # CELERY_TASK_TRACK_EXPIRED = os.getenv("CELERY_TASK_TRACK_EXPIRED", "true").lower() == "true"  # Habilitar seguimiento de tareas expiradas en Celery por defecto
    # CELERY_TASK_TRACK_RETRY = os.getenv("CELERY_TASK_TRACK_RETRY", "true").lower() == "true"  # Habilitar seguimiento de tareas reintentadas en Celery por defecto
    # CELERY_TASK_TRACK_SUCCESS = os.getenv("CELERY_TASK_TRACK_SUCCESS", "true").lower() == "true"  # Habilitar seguimiento de tareas exitosas en Celery por defecto
    # CELERY_TASK_TRACK_FAILURE = os.getenv("CELERY_TASK_TRACK_FAILURE", "true").lower() == "true"  # Habilitar seguimiento de tareas fallidas en Celery por defecto
    # CELERY_TASK_TRACK_RETRY_DELAY = int(os.getenv("CELERY_TASK_TRACK_RETRY_DELAY", 5))  # Retraso de reintento de tareas de Celery por defecto
    # CELERY_TASK_TRACK_RETRY_MAX = int(os.getenv("CELERY_TASK_TRACK_RETRY_MAX", 3))  # Máximo de reintentos de tareas de Celery por defecto
    # CELERY_TASK_TRACK_RETRY_BACKOFF = int(os.getenv("CELERY_TASK_TRACK_RETRY_BACKOFF", 2))  # Retroceso de reintento de tareas de Celery por defecto
    
    # # Configuración de Redis
    # REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")  # URL de Redis por defecto
    # REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    # REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))  # Puerto de Redis por defecto
    # REDIS_DB = int(os.getenv("REDIS_DB", 0))  # Base de datos de Redis por defecto
    # REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")  # Contraseña de Redis (si es necesario)
    # REDIS_SSL = os.getenv("REDIS_SSL", "false").lower() == "true"  # SSL para Redis por defecto
    # REDIS_SSL_CERT = os.getenv("REDIS_SSL_CERT")  # Certificado SSL para Redis (si es necesario)
    # REDIS_SSL_KEY = os.getenv("REDIS_SSL_KEY")  # Clave SSL para Redis (si es necesario)
    # REDIS_SSL_CA = os.getenv("REDIS_SSL_CA")  # CA SSL para Redis (si es necesario)
    # REDIS_SSL_CERT_REDIS = os.getenv("REDIS_SSL_CERT_REDIS")  # Certificado SSL para Redis (si es necesario)
    # REDIS_SSL_KEY_REDIS = os.getenv("REDIS_SSL_KEY_REDIS")  # Clave SSL para Redis (si es necesario)
    # REDIS_SSL_CA_REDIS = os.getenv("REDIS_SSL_CA_REDIS")  # CA SSL para Redis (si es necesario)
    # # Configuración de MongoDB
    # MONGODB_URL = os.getenv("MONGODB_URL")  # URL de MongoDB (si es necesario)
    # MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")  # Host de MongoDB por defecto
    # MONGODB_PORT = int(os.getenv("MONGODB_PORT", 27017))  # Puerto de MongoDB por defecto
    # MONGODB_DB = os.getenv("MONGODB_DB")  # Base de datos de MongoDB (si es necesario)
    # MONGODB_USER = os.getenv("MONGODB_USER")  # Usuario de MongoDB (si es necesario)
    # MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")  # Contraseña de MongoDB (si es necesario)
    # MONGODB_AUTH_SOURCE = os.getenv("MONGODB_AUTH_SOURCE", "admin")  # Fuente de autenticación de MongoDB por defecto
    # MONGODB_AUTH_MECHANISM = os.getenv("MONGODB_AUTH_MECHANISM", "SCRAM-SHA-256")  # Mecanismo de autenticación de MongoDB por defecto
    # MONGODB_SSL = os.getenv("MONGODB_SSL", "false").lower() == "true"  # SSL para MongoDB por defecto
    # MONGODB_SSL_CERT = os.getenv("MONGODB_SSL_CERT")  # Certificado SSL para MongoDB (si es necesario)
    # MONGODB_SSL_KEY = os.getenv("MONGODB_SSL_KEY")  # Clave SSL para MongoDB (si es necesario)
    # MONGODB_SSL_CA = os.getenv("MONGODB_SSL_CA")  # CA SSL para MongoDB (si es necesario)

    # # Configuración de GraphQL
    # GRAPHQL_ENABLED = os.getenv("GRAPHQL_ENABLED", "false").lower() == "true"  # Habilitar GraphQL por defecto
    # GRAPHQL_URL = os.getenv("GRAPHQL_URL", "/graphql")  # URL de GraphQL por defecto
    # GRAPHQL_SCHEMA = os.getenv("GRAPHQL_SCHEMA", "schema.graphql")  # Esquema de GraphQL por defecto
    # GRAPHQL_PLAYGROUND_ENABLED = os.getenv("GRAPHQL_PLAYGROUND_ENABLED", "false").lower() == "true"  # Habilitar Playground de GraphQL por defecto
    # GRAPHQL_PLAYGROUND_URL = os.getenv("GRAPHQL_PLAYGROUND_URL", "/playground")  # URL del Playground de GraphQL por defecto
    # GRAPHQL_PLAYGROUND_SETTINGS = os.getenv("GRAPHQL_PLAYGROUND_SETTINGS", '{"settings": {"editor.theme": "dark"}}')  # Configuración del Playground de GraphQL por defecto
    # # Configuración de OpenAPI
    # OPENAPI_ENABLED = os.getenv("OPENAPI_ENABLED", "true").lower() == "true"  # Habilitar OpenAPI por defecto
    # OPENAPI_URL = os.getenv("OPENAPI_URL", "/openapi.json")  # URL de OpenAPI por defecto
    # OPENAPI_TITLE = os.getenv("OPENAPI_TITLE", "Neptuno API")  # Título de OpenAPI por defecto
    # OPENAPI_VERSION = os.getenv("OPENAPI_VERSION", "3.0.0")  # Versión de OpenAPI por defecto
    # OPENAPI_DESCRIPTION = os.getenv("OPENAPI_DESCRIPTION", "API de Neptuno")  # Descripción de OpenAPI por defecto
    # OPENAPI_TERMS_OF_SERVICE = os.getenv("OPENAPI_TERMS_OF_SERVICE", "https://example.com/terms/")  # URL de los términos de servicio de OpenAPI por defecto
    # OPENAPI_CONTACT_NAME = os.getenv("OPENAPI_CONTACT_NAME", "Soporte Neptuno")  # Nombre de contacto de OpenAPI por defecto
    # OPENAPI_CONTACT_URL = os.getenv("OPENAPI_CONTACT_URL", "https://example.com/contact/")  # URL de contacto de OpenAPI por defecto
    
    # # Configuración de Swagger
    # SWAGGER_ENABLED = os.getenv("SWAGGER_ENABLED", "true").lower() == "true"  # Habilitar Swagger por defecto
    # SWAGGER_URL = os.getenv("SWAGGER_URL", "/swagger.json")  # URL de Swagger por defecto
    # SWAGGER_TITLE = os.getenv("SWAGGER_TITLE", "Neptuno API")  # Título de Swagger por defecto
    # SWAGGER_VERSION = os.getenv("SWAGGER_VERSION", "3.0.0")  # Versión de Swagger por defecto
    # SWAGGER_DESCRIPTION = os.getenv("SWAGGER_DESCRIPTION", "API de Neptuno")  # Descripción de Swagger por defecto
    # SWAGGER_TERMS_OF_SERVICE = os.getenv("SWAGGER_TERMS_OF_SERVICE", "https://example.com/terms/")  # URL de los términos de servicio de Swagger por defecto
    # SWAGGER_CONTACT_NAME = os.getenv("SWAGGER_CONTACT_NAME", "Soporte Neptuno")  # Nombre de contacto de Swagger por defecto
    # SWAGGER_CONTACT_URL = os.getenv("SWAGGER_CONTACT_URL", "https://example.com/contact/")  # URL de contacto de Swagger por defecto
    # SWAGGER_LICENSE_NAME = os.getenv("SWAGGER_LICENSE_NAME", "MIT")  # Nombre de la licencia de Swagger por defecto
    # SWAGGER_LICENSE_URL = os.getenv("SWAGGER_LICENSE_URL", "https://opensource.org/licenses/MIT")  # URL de la licencia de Swagger por defecto
    # SWAGGER_SERVE_STATIC = os.getenv("SWAGGER_SERVE_STATIC", "true").lower() == "true"  # Servir archivos estáticos de Swagger por defecto
    # SWAGGER_SERVE_STATIC_URL = os.getenv("SWAGGER_SERVE_STATIC_URL", "/static/swagger/")  # URL de los archivos estáticos de Swagger por defecto
    # SWAGGER_SERVE_STATIC_DIR = os.getenv("SWAGGER_SERVE_STATIC_DIR", "static/swagger/")  # Directorio de los archivos estáticos de Swagger por defecto
    # SWAGGER_SERVE_STATIC_CACHE = os.getenv("SWAGGER_SERVE_STATIC_CACHE", "true").lower() == "true"  # Habilitar caché de archivos estáticos de Swagger por defecto 



settings = Settings()