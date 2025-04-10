# sdk/exceptions.py

class SDKError(Exception):
    """Base class for all SDK-related exceptions."""


class UnauthorizedError(SDKError):
    """Raised when authentication fails."""


class NotFoundError(SDKError):
    """Raised when a resource is not found."""


class ValidationError(SDKError):
    """Raised when API returns a 422 validation error."""


class ServerError(SDKError):
    """Raised for generic 5xx server errors."""


class ConflictError(SDKError):
    """Raised when a conflict (409) occurs."""
