from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import OAuth2ClientCredentialsProvider
from core.config import config

class TeamsConnector(BaseConnector):
    """
    Real Connector for Microsoft Teams via Microsoft Graph API.
    """

    def __init__(self):
        super().__init__()
        if config.MS_TENANT_ID and config.MS_CLIENT_ID and config.MS_CLIENT_SECRET:
            # Microsoft Graph OAuth2
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
            print("WARNING: Microsoft Graph credentials not found. TeamsConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "teams_send_message",
                "description": "Sends a message to a Teams channel or chat.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "team_id": {"type": "string", "description": "The Team ID."},
                        "channel_id": {"type": "string", "description": "The Channel ID."},
                        "message": {"type": "string", "description": "The message content."}
                    },
                    "required": ["team_id", "channel_id", "message"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Microsoft Graph credentials not configured."

        if tool_name == "teams_send_message":
            return self._send_message(
                kwargs.get("team_id"),
                kwargs.get("channel_id"),
                kwargs.get("message")
            )
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _send_message(self, team_id: str, channel_id: str, message: str) -> Dict[str, Any]:
        endpoint = f"teams/{team_id}/channels/{channel_id}/messages"
        payload = {
            "body": {
                "content": message
            }
        }
        
        data = self.client.post(endpoint, json=payload)
        if not data: return {"error": "Failed to send message"}
        
        return {
            "id": data.get("id"),
            "createdDateTime": data.get("createdDateTime"),
            "message": "Message sent successfully"
        }
