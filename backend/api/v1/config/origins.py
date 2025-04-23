# backend/api/v1/origins.py
# Endpoints para gestión de orígenes permitidos (CORS)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.allowed_origin import AllowedOrigin
from schemas.allowed_origin import AllowedOriginCreate, AllowedOriginResponse

router = APIRouter(tags=["Origins"])

@router.get("/", response_model=list[AllowedOriginResponse])
def get_origins(db: Session = Depends(get_db)):
    return db.query(AllowedOrigin).all()

@router.post("/", response_model=AllowedOriginResponse)
def create_origin(origin: AllowedOriginCreate, db: Session = Depends(get_db)):
    db_origin = AllowedOrigin(origin=origin.origin)
    db.add(db_origin)
    db.commit()
    db.refresh(db_origin)
    return db_origin

@router.delete("/{origin_id}")
def delete_origin(origin_id: int, db: Session = Depends(get_db)):
    origin = db.query(AllowedOrigin).filter(AllowedOrigin.id == origin_id).first()
    if not origin:
        raise HTTPException(status_code=404, detail="Origin not found")
    db.delete(origin)
    db.commit()
    return {"message": "Origin deleted"}