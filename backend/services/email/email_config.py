# services/email/email_config.py

from services.settings_service import get_setting
from sqlalchemy.orm import Session

class EmailSettings:
    def __init__(self, db: Session):
        self.db = db

    def get(self, key: str, fallback: str = ""):
        return get_setting(self.db, key) or fallback

    def get_int(self, key: str, fallback: int = 0):
        val = self.get(key)
        try:
            return int(val)
        except:
            return fallback

    def smtp_config(self):
        return {
            "host": self.get("smtp_host"),
            "port": self.get_int("smtp_port", 587),
            "user": self.get("smtp_user"),
            "pass": self.get("smtp_pass"),
        }

    def sendgrid_api_key(self):
        return self.get("sendgrid_api_key")

    def mailgun_config(self):
        return {
            "api_key": self.get("mailgun_api_key"),
            "domain": self.get("mailgun_domain"),
        }

    def ses_config(self):
        return {
            "access_key": self.get("aws_access_key"),
            "secret_key": self.get("aws_secret_key"),
            "region": self.get("aws_region"),
        }

    def mail_from(self):
        return {
            "email": self.get("mail_from", "no-reply@neptuno.com"),
            "name": self.get("mail_from_name", "Neptuno")
        }
