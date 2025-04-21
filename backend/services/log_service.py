# backend/services/log_service.py
# Servicio para limpiar logs de API y errores

from sqlalchemy.orm import Session
from models.log import APILog  # Ajusta la ruta si es diferente
from models.error_log import ErrorLog  # Ajusta la ruta si es diferente

def clear_api_logs(db: Session) -> None:
    """
    Elimina todos los logs de la API de la base de datos.
    """
    db.query(APILog).delete()
    db.commit()

def clear_error_logs(db: Session) -> None:
    """
    Elimina todos los errores registrados de la base de datos.
    """
    db.query(ErrorLog).delete()
    db.commit()