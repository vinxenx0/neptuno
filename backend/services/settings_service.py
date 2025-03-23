# backend/services/settings_service.py
import json
from sqlalchemy.orm import Session
from models.site_settings import SiteSettings
from core.logging import configure_logging
from fastapi import HTTPException

logger = configure_logging()

def update_setting(db: Session, admin_id: str, key: str, value: str, description: str = None, tag: str = None):
    try:
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
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al actualizar ajuste {key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al actualizar ajuste")

def get_all_settings(db: Session, admin_id: str):
    try:
        from models.user import User
        admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
        if not admin:
            raise HTTPException(status_code=403, detail="Solo administradores pueden ver configuraciones")
        
        settings = db.query(SiteSettings).all()
        return settings
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al obtener ajustes para admin {admin_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al obtener ajustes")

def get_setting(db: Session, key: str) -> dict | list | int | str | None:
    try:
        setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
        if not setting:
            return None
        value = setting.value
        try:
            return json.loads(value)  # Intentar deserializar como JSON
        except json.JSONDecodeError:
            # Si falla, intentar limpiar comillas adicionales y devolver la cadena
            cleaned_value = value.strip('"')
            try:
                return json.loads(cleaned_value)  # Reintentar con el valor limpio
            except json.JSONDecodeError:
                return cleaned_value  # Devolver la cadena limpia si no es JSON válido
    except Exception as e:
        logger.error(f"Error al obtener ajuste {key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al obtener ajuste")

def set_setting(db: Session, key: str, value: any, admin_id: str, description: str = None):
    try:
        from models.user import User
        admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
        if not admin:
            raise HTTPException(status_code=403, detail="Solo administradores pueden modificar configuraciones")
        
        setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
        serialized_value = json.dumps(value)  # Serializar a JSON
        if setting:
            setting.value = serialized_value
            setting.description = description or setting.description
        else:
            setting = SiteSettings(key=key, value=serialized_value, description=description)
            db.add(setting)
        db.commit()
        logger.info(f"Configuración '{key}' actualizada por admin {admin_id}: {value}")
        return {"key": key, "value": value}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al establecer ajuste {key}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al establecer ajuste")

#def get_all_settings(db: Session, admin_id: str) -> dict:
#    from models.user import User
#    admin = db.query(User).filter(User.id == admin_id, User.rol == "admin").first()
#    if not admin:
#        raise HTTPException(status_code=403, detail="Solo administradores pueden ver configuraciones")
#    
#    settings = db.query(SiteSettings).all()
#    return {s.key: json.loads(s.value) for s in settings}