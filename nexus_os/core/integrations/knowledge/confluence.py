from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import BasicAuthProvider
from nexus_os.core.config import config

class ConfluenceConnector(BaseConnector):
    """
    Real Connector for Confluence Cloud.
    """

    def __init__(self):
        super().__init__()
        if config.ATLASSIAN_DOMAIN and config.ATLASSIAN_USER and config.ATLASSIAN_TOKEN:
            self.auth = BasicAuthProvider(
                username=config.ATLASSIAN_USER,
                token=config.ATLASSIAN_TOKEN
            )
            
            self.client = APIClient(
                base_url=f"https://{config.ATLASSIAN_DOMAIN}.atlassian.net/wiki/rest/api",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Atlassian credentials not found. ConfluenceConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "confluence_get_page",
                "description": "Retrieves a Confluence page by ID or title.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "page_id": {"type": "string", "description": "The Page ID."},
                        "title": {"type": "string", "description": "The Page Title (exact match)."}
                    }
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Atlassian credentials not configured."

        if tool_name == "confluence_get_page":
            return self._get_page(kwargs.get("page_id"), kwargs.get("title"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_page(self, page_id: str = None, title: str = None) -> Dict[str, Any]:
        endpoint = "content"
        params = {"expand": "body.storage"}
        
        if page_id:
            endpoint = f"content/{page_id}"
        elif title:
            params["title"] = title
            
        data = self.client.get(endpoint, params=params)
        if not data: return {"message": "Page not found"}
        
        if title:
            # Search returns a list
            results = data.get("results", [])
            if not results: return {"message": "Page not found"}
            page = results[0]
        else:
            page = data
            
        return {
            "id": page.get("id"),
            "title": page.get("title"),
            "body": page.get("body", {}).get("storage", {}).get("value")
        }
