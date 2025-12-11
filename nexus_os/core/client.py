import requests
from typing import Optional, Dict, Any, Union
from nexus_os.core.auth import AuthProvider

class APIClient:
    """
    Generic API Client wrapper for internal integrations.
    Handles auth injection and basic HTTP methods.
    """
    def __init__(self, base_url: str, auth_provider: Optional[AuthProvider] = None):
        self.base_url = base_url.rstrip("/")
        self.auth_provider = auth_provider
        self.session = requests.Session()
    
    def _get_headers(self, headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        final_headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.auth_provider:
             final_headers.update(self.auth_provider.get_headers())
        if headers:
            final_headers.update(headers)
        return final_headers

    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.get(url, params=params, headers=self._get_headers(headers))
        resp.raise_for_status()
        return resp.json()

    def post(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.post(url, json=json, headers=self._get_headers(headers))
        resp.raise_for_status()
        return resp.json()

    def patch(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.patch(url, json=json, headers=self._get_headers(headers))
        resp.raise_for_status()
        return resp.json()

    def put(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.put(url, json=json, headers=self._get_headers(headers))
        resp.raise_for_status()
        return resp.json()

    def delete(self, endpoint: str, headers: Optional[Dict[str, str]] = None) -> Any:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.delete(url, headers=self._get_headers(headers))
        resp.raise_for_status()
        return resp.json()
