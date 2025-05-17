# backend/services/email/factory.py

from requests import Session
from services.settings_service import get_setting
from core.config import settings
from services.email.sendgrid import SendGridProvider
from services.email.smtp import SMTPProvider
from services.email.mailgun import MailgunProvider
from services.email.ses import SESProvider
from services.email.base import EmailProvider

def get_email_provider(db: Session):
    setting = get_setting(db, "email_provider") or settings.EMAIL_PROVIDER
    provider = setting.lower()

    if provider == "sendgrid":
        return SendGridProvider()
    elif provider == "mailgun":
        return MailgunProvider()
    elif provider == "ses":
        return SESProvider()
    return SMTPProvider()
