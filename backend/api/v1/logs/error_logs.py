# backend/api/v1/error_logs.py
# Endpoints para logs de errores (v1)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from core.logging import configure_logging
from models.error_log import ErrorLog
from schemas.error_log import ErrorLogResponse  # Asegúrate de que este esquema existe
from dependencies.auth import get_user_context
from core.database import get_db
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from services.log_service import clear_api_logs, clear_error_logs
from models.user import User

router = APIRouter(tags=["Errors"])
logger = configure_logging()


@router.get("/", response_model=dict)
def get_error_logs(page: int = Query(1, ge=1),
                   limit: int = Query(10, ge=1, le=100),
                   user=Depends(get_user_context),
                   db: Session = Depends(get_db)):
    if user.rol != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo los administradores pueden acceder a este recurso")

    offset = (page - 1) * limit
    query = db.query(ErrorLog)
    total_items = query.count()
    logs = query.offset(offset).limit(limit).all()

    # Convertir los modelos SQLAlchemy a esquemas Pydantic
    logs_data = [ErrorLogResponse.from_orm(log) for log in logs]

    logger.info(
        f"Logs encontrados: {len(logs)} para page={page}, limit={limit}")

    return {
        "data": logs_data,  # Usar los datos serializados
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_errors(db: Session = Depends(get_db),
                        current_user: User = Depends(get_user_context)):
    """
    Elimina todos los errores registrados. Solo accesible para administradores.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=
            "No autorizado. Solo administradores pueden vaciar errores.")
    clear_error_logs(db)
    return None  # HTTP 204 no devuelve contenido
