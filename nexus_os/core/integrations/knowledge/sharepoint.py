from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import OAuth2ClientCredentialsProvider
from nexus_os.core.config import config

class SharePointConnector(BaseConnector):
    """
    Real Connector for SharePoint via Microsoft Graph API.
    """

    def __init__(self):
        super().__init__()
        if config.MS_TENANT_ID and config.MS_CLIENT_ID and config.MS_CLIENT_SECRET:
            # Microsoft Graph OAuth2 (Same as Teams)
            token_url = f"https://login.microsoftonline.com/{config.MS_TENANT_ID}/oauth2/v2.0/token"
            scope = "https://graph.microsoft.com/.default"
            
            self.auth = OAuth2ClientCredentialsProvider(
                token_url=token_url,
                client_id=config.MS_CLIENT_ID,
                client_secret=config.MS_CLIENT_SECRET,
                scope=scope
            )
            
            self.client = APIClient(
                base_url="https://graph.microsoft.com/v1.0",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Microsoft Graph credentials not found. SharePointConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "sharepoint_search_docs",
                "description": "Searches for documents in SharePoint.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query."}
                    },
                    "required": ["query"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Microsoft Graph credentials not configured."

        if tool_name == "sharepoint_search_docs":
            return self._search_docs(kwargs.get("query"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _search_docs(self, query: str) -> List[Dict[str, Any]]:
        endpoint = "search/query"
        payload = {
            "requests": [
                {
                    "entityTypes": ["driveItem"],
                    "query": {
                        "queryString": query
                    }
                }
            ]
        }
        
        data = self.client.post(endpoint, json=payload)
        if not data: return []
        
        # Parse Graph Search Response
        results = []
        try:
            hits = data["value"][0]["hitsContainers"][0]["hits"]
            for hit in hits:
                resource = hit["resource"]
                results.append({
                    "name": resource.get("name"),
                    "webUrl": resource.get("webUrl"),
                    "lastModifiedDateTime": resource.get("lastModifiedDateTime")
                })
        except (KeyError, IndexError):
            pass
            
        return results
