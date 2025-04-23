# backend/main.py
# Punto de entrada principal de la API FastAPI
# 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
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

from api.v1.users import users
from api.v1.health import test
from api.v1.transactions import payment_providers, payments, credit_transactions
from api.v1.logs import api_logs, error_logs
from api.v1.gamification import coupons, gamification
from api.v1.auth import auth
from api.v1.config import site_settings
from api.v1.config import integrations, origins
from api.v1.users import anonymous_sessions
from schemas.gamification import UserGamificationResponse
from ini_db import init_db, init_settings_and_users
from dependencies.auth import UserContext, get_user_context
from dependencies.credits import check_credits
from services.gamification_service import get_user_gamification, register_event
from services.integration_service import trigger_webhook
from services.settings_service import get_setting
from services.origin_service import get_allowed_origins
from services.credits_service import reset_credits
from core.database import get_db
from core.logging import configure_logging
from core.config import settings
from models.error_log import ErrorLog
from sqlalchemy.orm import Session

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
    #root_path="/api"
    proxy_headers=True  # Necesario para X-Forwarded-*
    #servers=[{"url": "/api", "description": "Local server"}],
    #openapi_url="/api/openapi.json",
    #swagger_ui_parameters={"url": "/api/openapi.json"}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo (en producción usa dominios exactos)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Añade esto para headers personalizados
)

#def configure_cors():
#    db = next(get_db())
#    allowed_origins_enabled = get_setting(db, "allowed_origins") == "true"
#    origins = [origin.origin for origin in db.query(AllowedOrigin).all()] if allowed_origins_enabled else ["*"]
#    app.add_middleware(
#        CORSMiddleware,
#        allow_origins=origins,
#        allow_credentials=True,
#        allow_methods=["*"],
#        allow_headers=["*"],
#    )#
#configure_cors()

logger = configure_logging()
# app.add_middleware(LoggingMiddleware)

# Middleware para confiar en el proxy
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

db = next(get_db())
#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=["*", #
#        "https://172.18.0.2:8000",
#        "https://localhost:8000",
#        "https://localhost:3000",
#        "http://localhost:8000",
#        "http://localhost:3000",
#        "https://neptuno.ciberpunk.es",
#        "http://neptuno.ciberpunk.es",
#        "127.0.0.0.1",
        #"194.164.164.177",
        #"neptuno.ciberpunk.es",
        #"172.18.0.3"
    #],  # Lista explícita de dominios permitidos
    #allow_origins=["*"], #allowed_origins = get_setting(db, "allowed_origins") or ["https://localhost:3000"]  # Valor por defecto
    #allow_credentials=True,
    #allow_methods=["*"],
#    allow_headers=["*"]
#)


#Base.metadata.create_all(bind=engine)



@app.on_event("startup")
async def startup_event():
    init_db()  # Crea las tablas si no existen
    init_settings_and_users()  # Pobla con datos iniciales si es necesario
    
    try:
        admin_id = 1
        logger.info(f"Iniciando {settings.PROJECT_NAME} en entorno {settings.ENVIRONMENT}")
        logger.info("Ejecutando renovación de créditos automática al iniciar")
        reset_credits(db, admin_id)
    except HTTPException as e:
        logger.error(f"Error HTTP en startup: {e.detail}")
    except Exception as e:
        logger.error(f"Error inesperado en startup: {str(e)}")
    finally:
        db.close()
        
#rate_limit_auth = get_setting(db, "rate_limit_auth") or {"times": 20, "seconds": 60}
#rate_limit_api = get_setting(db, "rate_limit_api") or {"times": 100, "seconds": 60}
#rate_limit_admin = get_setting(db, "rate_limit_admin") or {"times": 50, "seconds": 60}

async def get_rate_limit_key(request: Request, user: UserContext = Depends(get_user_context)):
        if user.user_type == "registered":
            return f"user:{user.user_id}"
        return f"ip:{request.client.host}"

app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/v1/users", tags=["users"])
app.include_router(test.router, prefix="/v1/test", tags=["test"])
app.include_router(payments.router, prefix="/v1/payments", tags=["payments"])
app.include_router(site_settings.router, prefix="/v1/settings", tags=["site_settings"])
app.include_router(integrations.router, prefix="/v1/integrations", tags=["integrations"])
#app.include_router(payments.router, prefix="/v1/payments", tags=["payments"], dependencies=[Depends(RateLimiter(**rate_limit_api, identifier=get_rate_limit_key))])
app.include_router(error_logs.router, prefix="/v1/errors", tags=["Errors"])
app.include_router(anonymous_sessions.router, prefix="/v1/sessions", tags=["Sessions"])
app.include_router(credit_transactions.router, prefix="/v1/transactions", tags=["Transactions"])
app.include_router(api_logs.router, prefix="/v1/logs", tags=["Logs"])
app.include_router(gamification.router, prefix="/v1/gamification", tags=["Gamification"])
app.include_router(payment_providers.router, prefix="/v1/payment-providers", tags=["Payment Providers"])
app.include_router(coupons.router, prefix="/v1/coupons", tags=["Coupons"])
app.include_router(origins.router, prefix="/v1/origins", tags=["Origins"])



@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    db = next(get_db())
    try:
        logger.error(f"HTTP Error {exc.status_code} en {request.method} {request.url}: {exc.detail}")
        error_log = ErrorLog(
            error_code=exc.status_code,
            message=exc.detail,
            url=str(request.url),
            method=request.method,
            ip_address=request.client.host
        )
        db.add(error_log)
        db.commit()
    finally:
        db.close()
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": exc.detail}}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    db = next(get_db())
    try:
        logger.critical(f"Error inesperado en {request.method} {request.url}: {str(exc)}")
        error_log = ErrorLog(
            error_code=500,
            message="Error interno del servidor",
            details=str(exc),
            url=str(request.url),
            method=request.method,
            ip_address=request.client.host
        )
        db.add(error_log)
        db.commit()
    finally:
        db.close()
    return JSONResponse(
        status_code=500,
        content={"error": {"code": 500, "message": "Error interno del servidor"}}
    )
    
# Health check endpoint para despliegue
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Ejecuta una consulta SQL simple utilizando text()
        db.execute(text("SELECT 1"))
        logger.info("Base de datos accesible")
        return {"status": "healthy", "environment": settings.ENVIRONMENT}
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        raise HTTPException(status_code=503, detail="Database unavailable")
    
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API Backend"}

@app.get("/whoami")
async def get_info(user: UserContext = Depends(get_user_context), db: Session = Depends(get_db)):
    disable_anonymous = get_setting(db, "disable_anonymous_users")
    base_info = {
        "user_id": user.user_id,
        "email": user.email,
        "username": user.username,
        "user_type": user.user_type,
        "subscription": user.subscription,
        "credits": user.credits,
        "rol": user.rol,
        "session_id": user.session_id if user.user_type == "anonymous" else None
    }

    gamification = get_user_gamification(db, user)
    gamification_data = [
        UserGamificationResponse.from_orm(g) for g in gamification
    ]

    return {**base_info, "gamification": gamification_data}


def configure_cors():
    db = next(get_db())
    try:
        allowed_origins_enabled = get_setting(db, "allowed_origins") == "true"
        origins = get_allowed_origins(db) if allowed_origins_enabled else ["*"]
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"], # origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info(f"CORS configurado con orígenes: {origins}")
    except Exception as e:
        logger.error(f"Error al configurar CORS: {str(e)}")
    finally:
        db.close()

configure_cors()