# backend/api/v1/error_logs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from core.logging import configure_logging
from models.error_log import ErrorLog
from schemas.error_log import ErrorLogResponse  # Asegúrate de que este esquema existe
from dependencies.auth import get_user_context
from core.database import get_db
from math import ceil

router = APIRouter(tags=["Errors"])
logger = configure_logging()

@router.get("/", response_model=dict)
def get_error_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user=Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden acceder a este recurso")
    
    offset = (page - 1) * limit
    query = db.query(ErrorLog)
    total_items = query.count()
    logs = query.offset(offset).limit(limit).all()
    
    # Convertir los modelos SQLAlchemy a esquemas Pydantic
    logs_data = [ErrorLogResponse.from_orm(log) for log in logs]
    
    logger.info(f"Logs encontrados: {len(logs)} para page={page}, limit={limit}")
    
    return {
        "data": logs_data,  # Usar los datos serializados
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }