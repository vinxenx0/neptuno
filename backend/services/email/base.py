# backend/services/email/base.py

from abc import ABC, abstractmethod

class EmailProvider(ABC):
    @abstractmethod
    async def send_email(self, to: str, subject: str, html: str):
        pass
