# Usa una imagen ligera de Python
FROM python:3.10-slim

# Define el directorio de trabajo en el contenedor
WORKDIR /neptuno

# Copia y instala las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY . .

# Exponer el puerto 8000
EXPOSE 8000

# Usar Gunicorn con Uvicorn para producción
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "main:app"]
