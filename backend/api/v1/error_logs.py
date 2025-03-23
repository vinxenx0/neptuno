from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from core.logging import configure_logging
from models.error_log import ErrorLog  # Asumimos que el modelo está en models/error_log.py
from schemas.error_log import ErrorLogResponse
from dependencies.auth import get_user_context  # Dependencia para autenticación
from core.database import get_db  # Dependencia para la base de datos

router = APIRouter(tags=["Errors"])
logger = configure_logging()

@router.get("/", response_model=List[ErrorLogResponse])
def get_error_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user=Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden acceder a este recurso")
    
    offset = (page - 1) * limit
    logs = db.query(ErrorLog).offset(offset).limit(limit).all()
    logger.info(f"Logs encontrados: {len(logs)} para page={page}, limit={limit}")
    return logs
