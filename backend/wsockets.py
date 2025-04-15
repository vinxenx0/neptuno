# backend/wsockets.py
import socketio
from fastapi import HTTPException
from core.security import decode_token
from models.user import User
from models.guests import GuestsSession
from core.database import get_db
import asyncio
from models.message import Message

# Crear instancia de Socket.IO como servidor ASGI
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

# Middleware de autenticación para WebSockets
@sio.on('connect')
async def websocket_auth(sid, environ):
    print(f"[Socket.IO] Intentando conectar: SID={sid}, HEADERS={environ}")
    token = environ.get('HTTP_AUTHORIZATION')
    session_id = environ.get('HTTP_X_SESSION_ID')
    
    print(f"[Socket.IO] Token recibido: {token}")
    print(f"[Socket.IO] Session ID recibido: {session_id}")
    if token:
        try:
            token = token.split(" ")[1]  # Extraer el token Bearer
            print(f"[Socket.IO] Decodificando token: {token}")
            payload = decode_token(token)
            print(f"[Socket.IO] Payload decodificado: {payload}")
            if payload:
                await sio.save_session(sid, {"user_id": payload["sub"], "user_type": payload["type"]})
                await sio.enter_room(sid, payload["sub"])  # Room por user_id
                print(f"[Socket.IO] Usuario autenticado conectado: {sid} - user_id: {payload['sub']}")
                return True
            else:
                print(f"[Socket.IO] Token decodificado pero sin payload válido")
        except Exception as e:
            print(f"[Socket.IO] Error en autenticación con token: {e}")
    elif session_id:
        print(f"[Socket.IO] Buscando sesión anónima en la base de datos: {session_id}")
        db = next(get_db())
        session = db.query(GuestsSession).filter(GuestsSession.id == session_id).first()
        if session:
            await sio.save_session(sid, {"session_id": session_id, "user_type": "anonymous"})
            await sio.enter_room(sid, session_id)  # Room por session_id
            print(f"[Socket.IO] Usuario anónimo conectado: {sid} - session_id: {session_id}")
            return True
        else:
            print(f"[Socket.IO] Sesión anónima no encontrada en la base de datos")
    print(f"[Socket.IO] Conexión rechazada para SID: {sid}")
    raise HTTPException(status_code=401, detail="No autorizado")

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    print(f"Cliente desconectado: {sid} - {session}")
    if session.get("user_id"):
        await sio.leave_room(sid, session["user_id"])
    elif session.get("session_id"):
        await sio.leave_room(sid, session["session_id"])

@sio.event
async def message(sid, data):
    session = await sio.get_session(sid)
    if not session.get("user_id"):
        return {"error": "Solo usuarios registrados pueden enviar mensajes"}
    from_user_id = session["user_id"]
    to_user_id = data.get("to_user_id")
    message_content = data.get("message")
    
    db = next(get_db())
    try:
        from_user = db.query(User).filter(User.id == int(from_user_id)).first()
        to_user = db.query(User).filter(User.id == int(to_user_id)).first()
        if not to_user:
            return {"error": "Usuario destino no encontrado"}
        
        db_message = Message(
            from_user_id=int(from_user_id),
            to_user_id=int(to_user_id),
            content=message_content
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        message_payload = {
            "id": db_message.id,
            "from": from_user.username,
            "to_user_id": to_user_id,
            "content": message_content,
            "timestamp": db_message.timestamp.isoformat()
        }
        await sio.emit('message', message_payload, room=to_user_id)
        return {"status": "Mensaje enviado", "message": message_payload}
    finally:
        db.close()

@sio.event
async def adminBroadcast(sid, data):
    session = await sio.get_session(sid)
    if not session.get("user_id"):
        return {"error": "Solo usuarios registrados pueden emitir broadcasts"}
    db = next(get_db())
    try:
        user = db.query(User).filter(User.id == int(session["user_id"])).first()
        if user.rol != "admin":
            return {"error": "Solo administradores pueden emitir broadcasts"}
        message = data.get("message")
        await sio.emit('adminBroadcast', {"message": message, "from": user.username})
        return {"status": "Broadcast enviado"}
    finally:
        db.close()

# Funciones helper para emitir eventos
async def notify_points(user_id: str, points: int):
    await sio.emit('pointsUpdate', {'points': points}, room=user_id)

async def notify_badge(user_id: str, badge: str):
    await sio.emit('newBadge', {'badge': badge}, room=user_id)

async def notify_message(to_user_id: str, message: dict):
    await sio.emit('message', message, room=to_user_id)

async def notify_broadcast(message: str, from_username: str):
    await sio.emit('adminBroadcast', {'message': message, "from": from_username})