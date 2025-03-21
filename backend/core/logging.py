# backend/core/logging.py
# Registrar eventos y errores para depuración y análisis.
import logging
from logging.handlers import RotatingFileHandler
from core.config import settings

def configure_logging():
    logger = logging.getLogger("NeptunO")
    logger.setLevel(logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG)
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler = RotatingFileHandler(
        "app.log",
        maxBytes=1024 * 1024,  # 1MB por archivo
        backupCount=5  # Mantener 5 archivos de respaldo
    )
    file_handler.setFormatter(formatter)
    if settings.ENVIRONMENT == "development":
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    return logger