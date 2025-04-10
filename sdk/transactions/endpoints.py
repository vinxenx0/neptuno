from typing import Dict
from client import request

def list_all_transactions(page: int = 1, limit: int = 10) -> Dict:
    return request("GET", "/credit-transactions", params={"page": page, "limit": limit})
