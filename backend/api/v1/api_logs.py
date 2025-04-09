# backend/api/v1/api_logs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from core.logging import configure_logging
from models.log import APILog
from schemas.api_log import APILogResponse  # Asegúrate de que este esquema existe
from dependencies.auth import get_user_context
from core.database import get_db
from math import ceil

router = APIRouter(tags=["Logs"])
logger = configure_logging()

@router.get("/", response_model=dict)
def get_api_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user=Depends(get_user_context),
    db: Session = Depends(get_db)
):
    """
    Retrieve a paginated list of API logs.

    Args:
        page (int): The page number to retrieve. Defaults to 1. Must be greater than or equal to 1.
        limit (int): The number of logs per page. Defaults to 10. Must be between 1 and 100.
        user: The user context, injected via dependency. Used to check if the user has admin privileges.
        db (Session): The database session, injected via dependency.

    Returns:
        dict: A dictionary containing the paginated logs, total items, total pages, and the current page.

    Raises:
        HTTPException: If the user does not have admin privileges (403 Forbidden).

    Example Response:
        {
            "data": [
                {
                    "id": 1,
                    "timestamp": "2023-01-01T12:00:00Z",
                    "endpoint": "/api/v1/resource",
                    "method": "GET",
                    "status_code": 200,
                    "user_id": 123
                }
            ],
            "total_items": 100,
            "total_pages": 10,
            "current_page": 1
        }
    """
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden acceder a este recurso")
    
    offset = (page - 1) * limit
    query = db.query(APILog)
    total_items = query.count()
    logs = query.offset(offset).limit(limit).all()
    
    # Convertir los modelos SQLAlchemy a esquemas Pydantic
    logs_data = [APILogResponse.from_orm(log) for log in logs]
    
    logger.info(f"Logs encontrados: {len(logs)} para page={page}, limit={limit}")
    
    return {
        "data": logs_data,  # Usar los datos serializados
        "total_items": total_items,
        "total_pages": ceil(total_items / limit),
        "current_page": page
    }