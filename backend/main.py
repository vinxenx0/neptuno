# backend/main.py
# Punto de entrada principal de la aplicación.
from fastapi import Depends, FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from api.v1 import auth, endpoints, payments, site_settings, integrations, payments
from middleware.logging import LoggingMiddleware
from dependencies.auth import UserContext, get_user_context
from services.settings_service import get_setting
from services.origin_service import get_allowed_origins
from core.database import Base, engine, get_db
from core.logging import configure_logging
from core.config import settings
from services.credits_service import reset_credits
from models.error_log import ErrorLog
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None
)
logger = configure_logging()
# app.add_middleware(LoggingMiddleware)

db = next(get_db())
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #allowed_origins = get_setting(db, "allowed_origins") or ["http://localhost:3000"]  # Valor por defecto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():

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
        
rate_limit_auth = get_setting(db, "rate_limit_auth") or {"times": 20, "seconds": 60}
rate_limit_api = get_setting(db, "rate_limit_api") or {"times": 100, "seconds": 60}
rate_limit_admin = get_setting(db, "rate_limit_admin") or {"times": 50, "seconds": 60}

async def get_rate_limit_key(request: Request, user: UserContext = Depends(get_user_context)):
        if user.user_type == "registered":
            return f"user:{user.user_id}"
        return f"ip:{request.client.host}"

app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(endpoints.router, prefix="/v1/api", tags=["api"])
app.include_router(payments.router, prefix="/v1/payments", tags=["payments"])
app.include_router(site_settings.router, prefix="/v1/settings", tags=["site_settings"])
app.include_router(integrations.router, prefix="/v1/integrations", tags=["integrations"])
#app.include_router(payments.router, prefix="/v1/payments", tags=["payments"], dependencies=[Depends(RateLimiter(**rate_limit_api, identifier=get_rate_limit_key))])


Base.metadata.create_all(bind=engine)



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