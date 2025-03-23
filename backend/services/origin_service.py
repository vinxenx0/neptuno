# backend/services/origin_service.py
from sqlalchemy.orm import Session
from models.user import User
from models.allowed_origin import AllowedOrigin
from core.logging import configure_logging
from fastapi import HTTPException

logger = configure_logging()

def get_allowed_origins(db: Session) -> list[str]:
    try:
        origins = db.query(AllowedOrigin).all()
        return [origin.origin for origin in origins]
    except Exception as e:
        logger.error(f"Error al obtener orígenes permitidos: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al obtener orígenes")

def add_allowed_origin(db: Session, origin: str, admin_id: int):
    try:
        admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
        if not admin:
            raise HTTPException(status_code=403, detail="Solo administradores")
        if db.query(AllowedOrigin).filter(AllowedOrigin.origin == origin).first():
            raise HTTPException(status_code=400, detail="Origen ya existe")
        new_origin = AllowedOrigin(origin=origin)
        db.add(new_origin)
        db.commit()
        logger.info(f"Origen permitido añadido: {origin} por admin {admin_id}")
        return {"origin": origin}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al añadir origen permitido {origin}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al añadir origen")