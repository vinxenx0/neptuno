from celery import Celery
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