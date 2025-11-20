import requests
from typing import Dict, Any, Optional
from core.auth import AuthProvider

class APIClient:
    def __init__(self, base_url: str, auth_provider: Optional[AuthProvider] = None):
        self.base_url = base_url.rstrip("/")
        self.auth_provider = auth_provider
        self.session = requests.Session()

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.auth_provider:
            headers.update(self.auth_provider.get_headers())
        return headers

    def request(self, method: str, endpoint: str, **kwargs) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        
        # Merge custom headers
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))

        try:
            response = self.session.request(method, url, headers=headers, **kwargs)
            response.raise_for_status()
            
            # Handle empty responses
            if response.status_code == 204:
                return None
                
            return response.json()
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error {e.response.status_code} for {url}: {e.response.text}")
            raise
        except requests.exceptions.RequestException as e:
            print(f"Request Error for {url}: {e}")
            raise

    def get(self, endpoint: str, params: Dict[str, Any] = None) -> Any:
        return self.request("GET", endpoint, params=params)

    def post(self, endpoint: str, data: Dict[str, Any] = None) -> Any:
        return self.request("POST", endpoint, json=data)

    def patch(self, endpoint: str, data: Dict[str, Any] = None) -> Any:
        return self.request("PATCH", endpoint, json=data)

    def delete(self, endpoint: str) -> Any:
        return self.request("DELETE", endpoint)
