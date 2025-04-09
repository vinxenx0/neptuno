from sdk.auth.endpoints import login
from sdk.models.auth import LoginRequest

creds = LoginRequest(username="user@domain.com", password="secret")
tokens = login(creds)
print(tokens.access_token)
