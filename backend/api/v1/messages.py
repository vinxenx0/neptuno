# backend/api/v1/messages.py
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from dependencies.auth import UserContext, get_user_context
from core.database import get_db
from models.message import Message
from schemas.message import MessageCreate, MessageResponse
from typing import List
from wsockets import notify_message

router = APIRouter(tags=["Messages"])

@router.post("/", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados pueden enviar mensajes")
    db_message = Message(
        from_user_id=int(user.user_id),
        to_user_id=message.to_user_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    message_payload = {
        "id": db_message.id,
        "from": user.username,
        "to_user_id": message.to_user_id,
        "content": message.content,
        "timestamp": db_message.timestamp.isoformat()
    }
    await notify_message(str(message.to_user_id), message_payload)
    return db_message

@router.get("/", response_model=List[MessageResponse])
async def get_messages(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados pueden ver mensajes")
    return db.query(Message).filter(
        (Message.to_user_id == int(user.user_id)) | (Message.from_user_id == int(user.user_id))
    ).all()

@router.get("/unread", response_model=dict)
async def get_unread_messages(
    user: UserContext = Depends(get_user_context),
    db: Session = Depends(get_db)
):
    if user.user_type != "registered":
        raise HTTPException(status_code=403, detail="Solo usuarios registrados pueden ver mensajes sin leer")
    count = db.query(Message).filter(
        Message.to_user_id == int(user.user_id),
        Message.timestamp > (db.query(User).filter(User.id == int(user.user_id)).first().last_login or datetime.min)
    ).count()
    return {"count": count}