# backend/api/v1/admin.py
from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import UserContext, get_user_context
from websockets import notify_broadcast

router = APIRouter(tags=["Admin"])

@router.post("/broadcast")
async def send_broadcast(
    message: str,
    user: UserContext = Depends(get_user_context)
):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden enviar broadcasts")
    await notify_broadcast(message, user.username)
    return {"message": "Broadcast enviado"}