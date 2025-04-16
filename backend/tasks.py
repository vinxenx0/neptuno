from datetime import datetime, timedelta
from celery import Celery
# from models.guests import GuestsSession
from core.config import settings
from core.database import SessionLocal
from services.credits_service import deduct_credit

celery_app = Celery("tasks", broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0")

@celery_app.task
def async_deduct_credit(user_id: int, amount: int = 1):
    db = SessionLocal()
    try:
        deduct_credit(db, user_id, amount)
    finally:
        db.close()

#  eliminar sesiones inactivas después de 30 días:

@celery_app.task
def cleanup_anonymous_sessions():
    db = SessionLocal()
    threshold = datetime.utcnow() - timedelta(days=30)
    db.query(GuestsSession).filter(GuestsSession.ultima_actividad < threshold).delete()
    db.commit()