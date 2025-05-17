# backend/services/email/base.py

import boto3
from botocore.exceptions import ClientError
from core.config import settings
from services.email.base import EmailProvider
import asyncio

class SESProvider(EmailProvider):
    async def send_email(self, to: str, subject: str, html: str):
        loop = asyncio.get_event_loop()

        def _send():
            client = boto3.client(
                "ses",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY,
                aws_secret_access_key=settings.AWS_SECRET_KEY
            )

            return client.send_email(
                Source=f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>",
                Destination={"ToAddresses": [to]},
                Message={
                    "Subject": {"Data": subject},
                    "Body": {
                        "Html": {"Data": html}
                    },
                },
            )

        await loop.run_in_executor(None, _send)
