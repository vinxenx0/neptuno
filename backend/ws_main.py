# ws_main.py - SOLO para WebSockets, sin middlewares FastAPI
import socketio

# Instancia de Socket.IO
from wsockets import sio  # Usa tu lógica de eventos en wsockets.py

sio_app = socketio.ASGIApp(sio, socketio_path="socket.io")

# Para correr: uvicorn backend.ws_main:sio_app --host 0.0.0.0 --port 8001