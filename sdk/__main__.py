# sdk/__main__.py
# python -m sdk login --username admin@example.com --password admin123 --base-url https://neptuno.ciberpunk.es/api/v1/auth

import argparse
from sdk.auth.endpoints import login
from sdk.models.auth import LoginRequest
from sdk.config import settings
from sdk.users.endpoints import get_me


def cli_login(args):
    settings.base_url = args.base_url
    creds = LoginRequest(username=args.username, password=args.password)
    tokens = login(creds)
    settings.access_token = tokens.access_token
    print("✅ Login exitoso")
    print("Access token:", tokens.access_token)


def cli_me(args):
    settings.base_url = args.base_url
    settings.access_token = args.token
    user = get_me()
    print("👤 Usuario:", user.username)
    print("Email:", user.email)


def main():
    parser = argparse.ArgumentParser(prog="neptuno-sdk", description="CLI para consumir la API de Neptuno")
    subparsers = parser.add_subparsers()

    # Login
    login_parser = subparsers.add_parser("login", help="Login y obtener token")
    login_parser.add_argument("--username", required=True)
    login_parser.add_argument("--password", required=True)
    login_parser.add_argument("--base-url", default="http://localhost:8000/v1/auth")
    login_parser.set_defaults(func=cli_login)

    # Get Me
    me_parser = subparsers.add_parser("me", help="Obtener usuario actual")
    me_parser.add_argument("--token", required=True)
    me_parser.add_argument("--base-url", default="http://localhost:8000/v1/auth")
    me_parser.set_defaults(func=cli_me)

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

