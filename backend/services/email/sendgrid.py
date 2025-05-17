# backend/services/email/base.py

import httpx
from core.config import settings
from services.email.base import EmailProvider

class SendGridProvider(EmailProvider):
    async def send_email(self, to: str, subject: str, html: str):
        url = "https://api.sendgrid.com/v3/mail/send"
        payload = {
            "personalizations": [{"to": [{"email": to}]}],
            "from": {"email": settings.MAIL_FROM, "name": settings.MAIL_FROM_NAME},
            "subject": subject,
            "content": [{"type": "text/html", "value": html}],
        }
        headers = {
            "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
