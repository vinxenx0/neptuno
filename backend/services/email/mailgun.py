# backend/services/email/base.py

import httpx
from core.config import settings
from services.email.base import EmailProvider

class MailgunProvider(EmailProvider):
    async def send_email(self, to: str, subject: str, html: str):
        url = f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages"

        data = {
            "from": f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>",
            "to": [to],
            "subject": subject,
            "html": html,
        }

        auth = ("api", settings.MAILGUN_API_KEY)

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data, auth=auth)
            response.raise_for_status()
