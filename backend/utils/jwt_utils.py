# backend/utils/jwt_utils.py
# Módulo de utilidades para JWT.
# Este archivo ya no es necesario, mover su contenido a security.py y eliminarlo

#
#import jwt
#from datetime import datetime, timedelta
##from os import getenv

#def create_token(user_id: str, user_type: str = "registered"):
#    payload = {
#        "sub": str(user_id),
#        "type": user_type,
####        "exp": datetime.utcnow() + timedelta(hours=24)
#    }
#    return jwt.encode(payload, getenv("SECRET_KEY"), algorithm="HS256")

#def decode_token(token: str):
#    try:
##        return jwt.decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])
#    except jwt.PyJWTError:
#        return None
#