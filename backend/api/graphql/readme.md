pip install strawberry-graphql strawberry-graphql-fastapi

==
= para actualizar el archivo main.py de backend
==

from fastapi import FastAPI
from api.v1.graphql.router import router as graphql_router

app = FastAPI()

# Include your existing REST routers
# app.include_router(auth_router, prefix="/v1/auth")

# Include GraphQL router
app.include_router(graphql_router, prefix="/v1")

=
== /* otra version */
=

from fastapi import FastAPI
from api.v1.rest.auth import router as auth_router
from api.v1.graphql.router import router as graphql_router

app = FastAPI()

# Existing REST API
app.include_router(auth_router, prefix="/v1/rest")

# New GraphQL API
app.include_router(graphql_router, prefix="/v1")


# Update Dependencies
#
# Modify your backend/dependencies/auth.py to make get_user_context async:

async def get_user_context(request: Request, db: Session = Depends(get_db)):
    # ... existing code ...


===
== ## testing
==

# Login
mutation {
  login(input: {username: "test@example.com", password: "password"}) {
    access_token
    refresh_token
    token_type
  }
}

# Get current user
query {
  me {
    id
    email
    username
  }
}

# Change password
mutation {
  changePassword(input: {currentPassword: "oldpass", newPassword: "newpass"})
}