# backend/core/config.py
# Módulo de configuración de la aplicación.
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    PROJECT_NAME = "Neptuno"
    SECRET_KEY = os.getenv("SECRET_KEY")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")  # "development" o "production"
    
    # Configuración de bases de datos
    SQLITE_URL = os.getenv("SQLITE_URL","sqlite:///dev.db")  # SQLite en desarrollo
    MYSQL_URL = os.getenv("MYSQL_URL")  # MySQL en producción (definido en .env)
    
    @property
    def DATABASE_URL(self):
        return self.SQLITE_URL if self.ENVIRONMENT == "development" else self.MYSQL_URL

settings = Settings()