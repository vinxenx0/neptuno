import uuid
from sdk.guests import endpoints as guest
from sdk.config import settings

guest_id = str(uuid.uuid4())
settings.session_id = guest_id
settings.user_type = "anonymous"
print("🧑‍🚀 Sesión anónima iniciada:", guest_id)

credits = guest.get_credits()
print(f"💸 Créditos disponibles: {credits['credits']}")
