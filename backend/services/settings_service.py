# backend/services/settings_service.py
import json
from sqlalchemy.orm import Session
from models.site_settings import SiteSettings
from core.logging import configure_logging
from fastapi import HTTPException

logger = configure_logging()

def update_setting(db: Session, admin_id: str, key: str, value: str, description: str = None, tag: str = None):
    from models.user import User
    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
    if not admin:
        raise HTTPException(status_code=403, detail="Solo administradores pueden modificar ajustes")
    
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if setting:
        setting.value = value
        setting.description = description
        setting.tag = tag
        setting.updated_by = admin_id
    else:
        setting = SiteSettings(key=key, value=value, description=description, tag=tag, updated_by=admin_id)
        db.add(setting)
        db.commit()
        logger.info(f"Ajuste {key} actualizado por admin ID {admin_id}")
    return {"key": key, "value": value, "tag": tag}

def get_all_settings(db: Session, admin_id: str):
    from models.user import User
    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
    if not admin:
      raise HTTPException(status_code=403, detail="Solo administradores pueden ver configuraciones")
    
    settings = db.query(SiteSettings).all()
    return settings # Devolver objetos completos, no solo key-value

def get_setting(db: Session, key: str) -> dict | list | int | str | None:
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if not setting:
        return None
    return json.loads(setting.value)

def set_setting(db: Session, key: str, value: any, admin_id: str, description: str = None):
    from models.user import User
    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
    if not admin:
        raise HTTPException(status_code=403, detail="Solo administradores pueden modificar configuraciones")
    
    setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
    if setting:
        setting.value = json.dumps(value)
        setting.description = description or setting.description
    else:
        setting = SiteSettings(key=key, value=json.dumps(value), description=description)
        db.add(setting)
    db.commit()
    logger.info(f"Configuración '{key}' actualizada por admin {admin_id}: {value}")
    return {"key": key, "value": value}

#def get_all_settings(db: Session, admin_id: str) -> dict:
#    from models.user import User
#    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
#    if not admin:
#        raise HTTPException(status_code=403, detail="Solo administradores pueden ver configuraciones")
#    
#    settings = db.query(SiteSettings).all()
#    return {s.key: json.loads(s.value) for s in settings}