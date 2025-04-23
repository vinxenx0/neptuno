# backend/main.py
from fastapi import FastAPI
from backend.api.v1.auth.auth import router as auth_router
from api.v1.users import router as users_router
from api.v1.gamification import router as gamification_router
from api.graphql.router import router as graphql_router

app = FastAPI()

# Existing REST endpoints
app.include_router(auth_router, prefix="/v1/auth")
app.include_router(users_router, prefix="/v1/users")
app.include_router(gamification_router, prefix="/v1/gamification")

# New GraphQL endpoint
app.include_router(graphql_router, prefix="/v1")