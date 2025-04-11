from sdk.config import settings
from sdk.auth.endpoints import login
from sdk.models.auth import LoginRequest
from sdk.users import endpoints as users
from sdk.gamification import endpoints as gamy
from sdk.payments import endpoints as payments
from sdk.models.payment import PaymentMethodCreate, PurchaseRequest
from sdk.models.gamification import GamificationEventCreate
from sdk.transactions import endpoints as transactions

def print_status(message, ok=True):
    status = "✅" if ok else "❌"
    print(f"{status} {message}")


def run_e2e_test():
    print("🚀 Starting end-to-end SDK test...")

    settings.base_url = "https://neptuno.ciberpunk.es/api"
    creds = LoginRequest(username="admin@example.com", password="admin123")

    try:
        tokens = login(creds)
        settings.access_token = tokens.access_token
        print_status("Login successful")
    except Exception as e:
        return print_status("Login failed", False)

    try:
        me = users.get_me()
        print_status(f"Fetched user: {me.username} with {me.credits} credits")
    except Exception:
        return print_status("Failed to get current user", False)

    try:
        method = payments.add_payment_method(PaymentMethodCreate(
            payment_type="credit_card",
            details="**** **** **** 4242",
            is_default=True
        ))
        print_status(f"Payment method added ID={method.id}")
    except Exception:
        return print_status("Failed to add payment method", False)

    try:
        purchase = payments.buy_credits(PurchaseRequest(
            credits=200,
            payment_amount=20.0,
            payment_method="stripe"
        ))
        print_status(f"Credits purchased: {purchase.credits_added}, new balance: {purchase.new_balance}")
    except Exception:
        return print_status("Credit purchase failed", False)

    try:
        txs = payments.list_credit_transactions()
        print_status(f"Found {len(txs)} personal transactions")
    except Exception:
        return print_status("Failed to fetch personal transactions", False)

    try:
        default = payments.set_default_method(method.id)
        print_status(f"Default payment method set: {default.id}")
    except Exception:
        return print_status("Failed to set default payment method", False)

    try:
        event = gamy.register_event(GamificationEventCreate(event_type_id=999))
        print_status(f"Gamification event registered ID={event.id}")
    except Exception:
        return print_status("Gamification event registration failed", False)

    try:
        gam = gamy.get_my_gamification()
        print_status(f"User gamification entries: {len(gam)}")
    except Exception:
        return print_status("Failed to get user gamification", False)

    try:
        rankings = gamy.get_rankings()
        print_status(f"Rankings fetched: Top user is {rankings[0].username}")
    except Exception:
        return print_status("Failed to fetch rankings", False)

    try:
        all_tx = transactions.list_all_transactions()
        print_status(f"Admin: {all_tx['total_items']} total credit transactions across all users")
    except Exception:
        return print_status("Failed to fetch admin transactions", False)

    

    print("✅ All steps completed successfully!")


if __name__ == "__main__":
    run_e2e_test()


# Eliminarme (si te atreves 😅)
# response = users.delete_me()
