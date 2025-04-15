#uvicorn main:app --reload
#uvicorn main:app --host 127.0.0.1 --port 8000 --ssl-keyfile ../ssl/key.pem --ssl-certfile ../ssl/cert.pem --reload
uvicorn main:app --host 127.0.0.1 --port 8000 --reload --log-level debug

