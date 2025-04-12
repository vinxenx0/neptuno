import os
import uuid
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from sdk.config import settings
from sdk.gamification import endpoints as gamy
from sdk.models.gamification import GamificationEventCreate
from sdk.guests import endpoints as anon

# 🔧 SDK Config
settings.base_url = "https://neptuno.ciberpunk.es/api/"
settings.access_token = None
settings.user_type = "anonymous"
settings.session_id = str(uuid.uuid4())

# 🧠 App Setup
app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="anonymous_budget_rocks")

BASE_PATH = os.path.dirname(__file__)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_PATH, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_PATH, "templates"))

# 📋 Opciones disponibles
OPTIONS = {
    "hosting": "Hosting Web",
    "diseño": "Diseño gráfico",
    "seo": "Optimización SEO",
    "ads": "Publicidad en Google Ads",
    "email": "Email marketing",
    "soporte": "Soporte técnico mensual"
}

EVENT_TYPE_ID = 2  # ID del evento gamificado del presupuesto


@app.get("/", response_class=HTMLResponse)
def show_form(request: Request):
    credits = anon.get_credits()["credits"]
    gamy_data = gamy.get_progress(event_type_id=EVENT_TYPE_ID)
    points = gamy_data.points

    return templates.TemplateResponse("index.html", {
        "request": request,
        "options": OPTIONS,
        "credits": credits,
        "points": points,
        "messages": request.session.pop("_flashes", [])
    })


@app.post("/submit")
def submit_form(request: Request, selected: list[str] = Form(...)):
    try:
        for item in selected:
            gamy.register_event(GamificationEventCreate(event_type_id=EVENT_TYPE_ID))

        gamification = gamy.get_progress(event_type_id=EVENT_TYPE_ID)
        points = gamification.points
        msg = f"🎯 Has generado {len(selected)} puntos en esta sesión. Tienes {points} puntos en total. 1 punto = 1 crédito."

        request.session.setdefault("_flashes", []).append(("info", msg))
    except Exception as e:
        error_msg = getattr(e, "detail", str(e))
        request.session.setdefault("_flashes", []).append(("error", f"❌ Error: {error_msg}"))

    return RedirectResponse("/", status_code=302)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("sdk.poc.budget.main:app", host="127.0.0.1", port=8080, reload=True)
