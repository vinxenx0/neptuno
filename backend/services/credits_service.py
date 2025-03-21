# backend/services/credits_service.py
# Permitir la renovación automática o manual de créditos para usuarios registrados y anónimos.
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User, PlanEnum
from models.session import AnonymousSession
from core.logging import configure_logging
from datetime import datetime

logger = configure_logging()

def reset_credits(db: Session, admin_user_id: int):
    """Reinicia los créditos de todos los usuarios y sesiones anónimas según su plan."""
    admin = db.query(User).filter(User.id == admin_user_id).first()
    if not admin or admin.rol != "admin":
        logger.error(f"Intento de resetear créditos por usuario no autorizado: ID {admin_user_id}")
        raise HTTPException(status_code=403, detail="Solo administradores pueden reiniciar créditos")

    # Actualizar usuarios registrados
    users = db.query(User).all()
    for user in users:
        new_credits = 100 if user.plan == PlanEnum.FREEMIUM else 1000  # Ejemplo: más créditos para premium/corporate
        user.consultas_restantes = new_credits
        user.fecha_renovacion = datetime.utcnow()
    
    # Actualizar sesiones anónimas
    sessions = db.query(AnonymousSession).all()
    for session in sessions:
        session.consultas_restantes = 100  # Anónimos siempre tienen 100
    
    db.commit()
    logger.info(f"Créditos reiniciados por admin ID {admin_user_id} para {len(users)} usuarios y {len(sessions)} sesiones anónimas")