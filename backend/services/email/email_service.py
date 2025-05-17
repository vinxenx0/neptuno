# backend/services/email/base.py

from jinja2 import Environment, FileSystemLoader
from requests import Session
from services.settings_service import get_setting
from core.config import Settings
from services.email.factory import get_email_provider


env = Environment(loader=FileSystemLoader("email_templates"))

async def send_email(db: Session, to: str, subject: str, template_name: str, context: dict):
    enabled = get_setting(db, "email_enabled")
    if enabled is not None and enabled.lower() != "true":
        return

    template = env.get_template(template_name)
    html = template.render(**context)

    provider = get_email_provider(db)
    await provider.send_email(to, subject, html, db)
