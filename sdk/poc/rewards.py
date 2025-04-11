# sdk/poc/init_gamification.py
from sdk.gamification import endpoints as gamy
from sdk.models.gamification import EventTypeCreate, BadgeCreate

def init_gamification():
    try:
        event = gamy.create_event_type(EventTypeCreate(
            name="tweet", description="Publicación o comentario", points_per_event=1
        ))
        print(f"✅ Evento creado: {event.id}")
    except Exception as e:
        print("ℹ️ Evento ya existe o error al crearlo.")

    for point, name in zip([1, 5, 10, 50], ["Fase 1", "Fase 2", "Fase 3", "Fase 4"]):
        try:
            badge = BadgeCreate(
                name=name,
                description=f"Has publicado {point} veces",
                event_type_id=1,
                required_points=point,
                user_type="registered"
            )
            gamy.create_badge(badge)
            print(f"🏅 Badge '{name}' creado.")
        except Exception:
            print(f"ℹ️ Badge '{name}' ya existe.")
