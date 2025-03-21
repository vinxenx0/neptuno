from fastapi import Request, Response
from sqlalchemy.orm import Session
from core.database import get_db
from models.log import APILog
# from core.logging import logger
import json
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        db = next(get_db())
        request_data = await request.body()
        response = await call_next(request)
        
        user_id = None
        if "Authorization" in request.headers:
            from dependencies.auth import get_user_context
            try:
                user = await get_user_context(request.headers["Authorization"].replace("Bearer ", ""))
                user_id = int(user.user_id)
            except:
                pass

        log_entry = APILog(
            user_id=user_id,
            endpoint=str(request.url.path),
            method=request.method,
            status_code=response.status_code,
            request_data=request_data.decode() if request_data else None,
            response_data=response.body.decode() if response.body else None
        )
        db.add(log_entry)
        db.commit()
        # logger.info(f"{request.method} {request.url.path} - Status: {response.status_code}")
        return response