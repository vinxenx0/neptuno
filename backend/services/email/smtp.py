# backend/services/email/base.py

import aiosmtplib
from email.message import EmailMessage
from core.config import settings
from services.email.base import EmailProvider
from services.email.base import EmailProvider
from email.message import EmailMessage
from services.email.email_config import EmailSettings

# 
class SMTPProvider(EmailProvider):
    async def send_email(self, to: str, subject: str, html: str, db):
        cfg = EmailSettings(db) # Igual para sendgrid.py, mailgun.py, ses.py → todos deben usar EmailSettings(db)
        smtp = cfg.smtp_config()
        sender = cfg.mail_from()

        message = EmailMessage()
        message["From"] = f"{sender['name']} <{sender['email']}>"
        message["To"] = to
        message["Subject"] = subject
        message.set_content(html, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=smtp["host"],
            port=smtp["port"],
            username=smtp["user"],
            password=smtp["pass"],
            start_tls=True
        )

class SMTPProvider_env(EmailProvider):
    async def send_email(self, to: str, subject: str, html: str):
        message = EmailMessage()
        message["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
        message["To"] = to
        message["Subject"] = subject
        message.set_content(html, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            start_tls=True
        )



