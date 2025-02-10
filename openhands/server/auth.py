from fastapi import Request
from pydantic import SecretStr


def get_github_token(request: Request) -> SecretStr | None:
    return getattr(request.state, 'github_token', None)


def get_user_id(request: Request) -> str | None:
    return getattr(request.state, 'github_user_id', None)

from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from openhands.core.logger import openhands_logger as logger


def get_sid_from_token(token: str, jwt_secret: str) -> str:
    """Retrieves the session id from a JWT token.

    Parameters:
        token (str): The JWT token from which the session id is to be extracted.

    Returns:
        str: The session id if found and valid, otherwise an empty string.
    """
    try:
        # Decode the JWT using the specified secret and algorithm
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])

        # Ensure the payload contains 'sid'
        if 'sid' in payload:
            return payload['sid']
        else:
            logger.error('SID not found in token')
            return ''
    except InvalidTokenError:
        logger.error('Invalid token')
    except Exception as e:
        logger.exception('Unexpected error decoding token: %s', e)
    return ''


def sign_token(payload: dict[str, object], jwt_secret: str, algorithm='HS256') -> str:
    """Signs a JWT token."""
    # payload = {
    #     "sid": sid,
    #     # "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    # }
    token = jwt.encode(payload, jwt_secret, algorithm=algorithm)
    return token if isinstance(token, str) else token.decode('utf-8')
