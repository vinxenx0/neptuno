from sqlalchemy.orm import Session
from models.user import User
from models.site_settings import SiteSettings
from core.logging import configure_logging
from fastapi import HTTPException

logger = configure_logging()

def update_setting(db: Session, admin_id: int, key: str, value: str, description: str = None):
    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
    if not admin:
        logger.warning(f"Intento no autorizado de actualizar ajuste por ID {admin_id}")
        raise HTTPException(status_code=403, detail="Solo administradores pueden modificar ajustes")
    
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if setting:
        setting.value = value
        setting.description = description
        setting.updated_by = admin_id
    else:
        setting = SiteSettings(key=key, value=value, description=description, updated_by=admin_id)
    db.add(setting)
    db.commit()
    logger.info(f"Ajuste {key} actualizado por admin ID {admin_id}")
    return {"key": key, "value": value}

def get_setting(db: Session, key: str):
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if not setting:
        logger.warning(f"Ajuste {key} no encontrado")
        raise HTTPException(status_code=404, detail="Ajuste no encontrado")
    return {"key": setting.key, "value": setting.value}