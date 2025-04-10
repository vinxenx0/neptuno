============================= test session starts ==============================
platform linux -- Python 3.10.16, pytest-8.3.5, pluggy-1.5.0
rootdir: /home/vinxenxo/neptuno/neptuno/sdk
plugins: anyio-4.9.0
collected 6 items

tests/test_e2e.py ...F.F                                                 [100%]

=================================== FAILURES ===================================
_____________________________ test_register_event ______________________________

    def test_register_event():
>       event = gamy.register_event(GamificationEventCreate(event_type_id=1))

tests/test_e2e.py:53: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 

event = GamificationEventCreate(event_type_id=1)

    def register_event(event: GamificationEventCreate) -> GamificationEventResponse:
        result = request("POST", "/v1/gamification/events", data=event.dict())
>       return GamificationEventResponse(**result)
E       pydantic_core._pydantic_core.ValidationError: 5 validation errors for GamificationEventResponse
E       id
E         Field required [type=missing, input_value={}, input_type=dict]
E           For further information visit https://errors.pydantic.dev/2.11/v/missing
E       event_type_id
E         Field required [type=missing, input_value={}, input_type=dict]
E           For further information visit https://errors.pydantic.dev/2.11/v/missing
E       user_id
E         Field required [type=missing, input_value={}, input_type=dict]
E           For further information visit https://errors.pydantic.dev/2.11/v/missing
E       session_id
E         Field required [type=missing, input_value={}, input_type=dict]
E           For further information visit https://errors.pydantic.dev/2.11/v/missing
E       timestamp
E         Field required [type=missing, input_value={}, input_type=dict]
E           For further information visit https://errors.pydantic.dev/2.11/v/missing

gamification/endpoints.py:17: ValidationError
________________________ test_admin_credit_transactions ________________________

    def test_admin_credit_transactions():
>       txs = transactions.list_all_transactions()

tests/test_e2e.py:63: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 

page = 1, limit = 10

    def list_all_transactions(page: int = 1, limit: int = 10) -> Dict:
>       return request("GET", "/credit-transactions", params={"page": page, "limit": limit})
E       TypeError: request() got an unexpected keyword argument 'params'

transactions/endpoints.py:5: TypeError
=============================== warnings summary ===============================
.venv/lib/python3.10/site-packages/pydantic/fields.py:1076
.venv/lib/python3.10/site-packages/pydantic/fields.py:1076
.venv/lib/python3.10/site-packages/pydantic/fields.py:1076
  /home/vinxenxo/neptuno/neptuno/sdk/.venv/lib/python3.10/site-packages/pydantic/fields.py:1076: PydanticDeprecatedSince20: Using extra keyword arguments on `Field` is deprecated and will be removed. Use `json_schema_extra` instead. (Extra keys: 'env'). Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    warn(

.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323
  /home/vinxenxo/neptuno/neptuno/sdk/.venv/lib/python3.10/site-packages/pydantic/_internal/_config.py:323: PydanticDeprecatedSince20: Support for class-based `config` is deprecated, use ConfigDict instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    warnings.warn(DEPRECATION_MESSAGE, DeprecationWarning)

tests/test_e2e.py::test_get_current_user
  /home/vinxenxo/neptuno/neptuno/sdk/auth/endpoints.py:13: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    result = request("POST", "/v1/auth/token", data=data.dict(), form=True)

tests/test_e2e.py::test_add_payment_method
  /home/vinxenxo/neptuno/neptuno/sdk/payments/endpoints.py:18: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    result = request("POST", "/v1/payments/methods", data=data.dict())

tests/test_e2e.py::test_buy_credits
  /home/vinxenxo/neptuno/neptuno/sdk/payments/endpoints.py:13: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    result = request("POST", "/v1/payments/purchase", data=data.dict())

tests/test_e2e.py::test_register_event
  /home/vinxenxo/neptuno/neptuno/sdk/gamification/endpoints.py:16: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.11/migration/
    result = request("POST", "/v1/gamification/events", data=event.dict())

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
=========================== short test summary info ============================
FAILED tests/test_e2e.py::test_register_event - pydantic_core._pydantic_core....
FAILED tests/test_e2e.py::test_admin_credit_transactions - TypeError: request...
=================== 2 failed, 4 passed, 15 warnings in 0.98s ===================
