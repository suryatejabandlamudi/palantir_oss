import time
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any

class AuthProvider(ABC):
    @abstractmethod
    def get_headers(self) -> Dict[str, str]:
        pass

class BasicAuthProvider(AuthProvider):
    def __init__(self, username: str, token: str):
        self.auth = (username, token)

    def get_headers(self) -> Dict[str, str]:
        # Requests handles basic auth tuple differently, but for raw headers:
        import base64
        token = base64.b64encode(f"{self.auth[0]}:{self.auth[1]}".encode()).decode()
        return {"Authorization": f"Basic {token}"}

class OAuth2ClientCredentialsProvider(AuthProvider):
    def __init__(self, token_url: str, client_id: str, client_secret: str, scope: str = None):
        self.token_url = token_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.scope = scope
        self._access_token = None
        self._expires_at = 0

    def _refresh_token(self):
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        if self.scope:
            data["scope"] = self.scope

        try:
            response = requests.post(self.token_url, data=data)
            response.raise_for_status()
            token_data = response.json()
            self._access_token = token_data["access_token"]
            # Default to 3599 seconds if not provided
            expires_in = token_data.get("expires_in", 3599)
            self._expires_at = time.time() + expires_in - 60 # Buffer
        except Exception as e:
            print(f"Error refreshing token for {self.token_url}: {e}")
            raise

    def get_headers(self) -> Dict[str, str]:
        if not self._access_token or time.time() >= self._expires_at:
            self._refresh_token()
        return {"Authorization": f"Bearer {self._access_token}"}
