import sys
import os

from sdk.poc.rewards import init_gamification

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# from fastapi import FlashMiddleware  # Añade este middleware
from starlette.middleware.sessions import SessionMiddleware

# python3 -m sdk.poc.main

from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from sdk.gamification import endpoints as gamy
from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sdk.auth import endpoints as auth
from sdk.users import endpoints as users
from sdk.models.auth import LoginRequest, RegisterRequest
from sdk.gamification import endpoints as gamy
from sdk.models.gamification import GamificationEventCreate
from sdk.config import settings
import uuid

# Configuración base
settings.base_url = "https://neptuno.ciberpunk.es/api/"
settings.access_token = None

# 👇 Añade esta variable global arriba del todo
SESSION = {"user": None, "token": None}

# En tu FastAPI app:
app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="neptuno_is_awesome_123")
# app.add_middleware(FlashMiddleware, secret_key="supersecret")

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")),
    name="static")
templates = Jinja2Templates(
    directory=os.path.join(os.path.dirname(__file__), "templates"))

# Simulación de tweets
TWEETS = []
TWEET_EVENT_ID = 1  # ID del evento gamificado "tweet"

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    user = SESSION.get("user")
    points = 0
    badges = 0
    if user:
        gamy_data = gamy.get_my_gamification()
        points = sum(g.points for g in gamy_data)
        badges = len([g for g in gamy_data if g.badge is not None])

    return templates.TemplateResponse(
        "index.html", {
            "request": request,
            "tweets": TWEETS,
            "user": user,
            "points": points,
            "badges": badges,
            "messages": request.session.pop("_flashes", [])
        })


@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    try:
        creds = LoginRequest(username=username, password=password)
        tokens = auth.login(creds)
        settings.access_token = tokens.access_token
        SESSION["token"] = tokens.access_token
        SESSION["user"] = users.get_me()
        return RedirectResponse("/", status_code=302)
    except Exception as e:
        print("❌ Login failed:", e)
        return RedirectResponse("/", status_code=302)


@app.post("/register")
def register(username: str = Form(...),
             email: str = Form(...),
             password: str = Form(...)):
    data = {"username": username, "email": email, "password": password}
    tokens = auth.register(data)
    settings.access_token = tokens.access_token
    SESSION["token"] = tokens.access_token
    SESSION["user"] = users.get_me()
    return RedirectResponse("/", status_code=302)


from sdk.transactions import endpoints as transactions
from sdk.gamification import endpoints as gamy
from sdk.models.gamification import GamificationEventCreate


@app.post("/tweet")
def tweet(request: Request,
          content: str = Form(...),
          parent_id: str = Form(None)):
    try:
        tweet = {
            "id": uuid.uuid4().hex,
            "user": SESSION["user"].username,
            "user_id": SESSION["user"].id,
            "content": content,
            "parent_id": parent_id
        }
        TWEETS.append(tweet)

        # Créditos
        transactions.deduct_credit()
        request.session.setdefault("_flashes", []).append(
            ("info", "💸 Se ha descontado 1 crédito"))

        # Gamificación
        gamy.register_event(GamificationEventCreate(event_type_id=1))
        gamification = gamy.get_progress(event_type_id=1)

        if gamification.badge:
            request.session.setdefault("_flashes", []).append(
                ("info",
                 f"🎉 Has ganado la insignia: {gamification.badge.name}"))

        return RedirectResponse("/", status_code=302)
    except Exception as e:
        request.session.setdefault("_flashes", []).append(
            ("error", f"❌ Error: {str(e)}"))
        return RedirectResponse("/", status_code=302)


@app.post("/logout")
def logout():
    SESSION["token"] = None
    SESSION["user"] = None
    settings.access_token = None
    return RedirectResponse("/", status_code=302)


@app.get("/timeline", response_class=HTMLResponse)
def timeline(request: Request):
    timeline = build_timeline()
    user = SESSION.get("user")
    return templates.TemplateResponse("timeline.html", {
        "request": request,
        "user": user,
        "timeline": timeline,
    })


def build_thread(tweet_id: str, tweets: list) -> list:
    children = [t for t in tweets if t.get("parent_id") == tweet_id]
    for child in children:
        child["replies"] = build_thread(child["id"], tweets)
    return children


def build_timeline():
    root_tweets = [t for t in TWEETS if t.get("parent_id") is None]
    for tweet in root_tweets:
        tweet["replies"] = build_thread(tweet["id"], TWEETS)
    return root_tweets


if __name__ == "__main__":
    import uvicorn
    init_gamification()
    uvicorn.run("sdk.poc.main:app", host="127.0.0.1", port=8000, reload=True)
