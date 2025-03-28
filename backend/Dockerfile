# Usa una imagen ligera de Python
FROM python:3.10-slim

# Define el directorio de trabajo en el contenedor
WORKDIR /app

# Copia y instala las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Copia el código fuente
COPY . .

#RUN python3 initial_data.py

# Exponer el puerto 8000
EXPOSE 8000

# Usar Gunicorn con Uvicorn para producción
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "main:app"]
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
#ExecStart=/var/www/ciberpunk.es/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
#CMD ["sh", "-c", "python -m initial_data && uvicorn main:app --host 0.0.0.0 --port 8000"]