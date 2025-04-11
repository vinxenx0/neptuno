# /sdk/tests/test_e2e.py
# python -m pytest tests
import pytest
from sdk.auth.endpoints  import login
from sdk.models.auth import LoginRequest
from sdk.users import endpoints as users
from sdk.gamification import endpoints as gamy
from sdk.models.gamification import GamificationEventCreate
from sdk.payments import endpoints as payments
from sdk.models.payment import PaymentMethodCreate, PurchaseRequest
from sdk.transactions import endpoints as transactions
from sdk.config import settings

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))



@pytest.fixture(scope="module", autouse=True)
def setup():
    settings.base_url = "https://neptuno.ciberpunk.es/api"
    creds = LoginRequest(username="admin@example.com", password="admin123")
    tokens = login(creds)
    settings.access_token = tokens.access_token


def test_get_current_user():
    me = users.get_me()
    assert me.username, "Username should not be empty"


def test_add_payment_method():
    method = payments.add_payment_method(PaymentMethodCreate(
        payment_type="credit_card",
        details="**** **** **** 4242",
        is_default=True
    ))
    assert method.id > 0


def test_buy_credits():
    purchase = payments.buy_credits(PurchaseRequest(
        credits=100,
        payment_amount=10.0,
        payment_method="stripe"
    ))
    assert purchase.credits_added == 100


def test_register_event():
    event = gamy.register_event(GamificationEventCreate(event_type_id=1))
    assert event.id > 0


def test_get_rankings():
    rankings = gamy.get_rankings()
    assert len(rankings) > 0


def test_admin_credit_transactions():
    txs = transactions.list_all_transactions()
    assert txs["total_items"] >= 0
