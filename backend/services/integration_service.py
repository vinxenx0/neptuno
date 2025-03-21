from datetime import datetime
from sqlalchemy.orm import Session
from models.integration import Integration
from core.logging import configure_logging
from fastapi import HTTPException
import requests

logger = configure_logging()

def add_integration(db: Session, user_id: int, name: str, webhook_url: str, event_type: str):
    integration = Integration(
        user_id=user_id,
        name=name,
        webhook_url=webhook_url,
        event_type=event_type
    )
    db.add(integration)
    db.commit()
    logger.info(f"Integración {name} añadida para usuario ID {user_id}")
    return integration

def trigger_webhook(db: Session, event_type: str, payload: dict):
    integrations = db.query(Integration).filter(Integration.event_type == event_type, Integration.active == True).all()
    for integration in integrations:
        try:
            response = requests.post(integration.webhook_url, json=payload, timeout=5)
            if response.status_code == 200:
                integration.last_triggered = datetime.utcnow()
                db.commit()
                logger.info(f"Webhook disparado para integración ID {integration.id}")
            else:
                logger.warning(f"Webhook falló para integración ID {integration.id}: {response.status_code}")
        except Exception as e:
            logger.error(f"Error al disparar webhook ID {integration.id}: {str(e)}")