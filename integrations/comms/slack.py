from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import AuthProvider
from core.config import config

class SlackAuthProvider(AuthProvider):
    def __init__(self, token: str):
        self.token = token

    def get_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

class SlackConnector(BaseConnector):
    """
    Real Connector for Slack.
    """

    def __init__(self):
        super().__init__()
        if config.SLACK_BOT_TOKEN:
            self.auth = SlackAuthProvider(config.SLACK_BOT_TOKEN)
            
            self.client = APIClient(
                base_url="https://slack.com/api",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Slack credentials not found. SlackConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "slack_send_message",
                "description": "Sends a message to a Slack channel.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "channel": {"type": "string", "description": "Channel ID or name."},
                        "text": {"type": "string", "description": "The message text."}
                    },
                    "required": ["channel", "text"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Slack credentials not configured."

        if tool_name == "slack_send_message":
            return self._send_message(kwargs.get("channel"), kwargs.get("text"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _send_message(self, channel: str, text: str) -> Dict[str, Any]:
        endpoint = "chat.postMessage"
        payload = {
            "channel": channel,
            "text": text
        }
        
        data = self.client.post(endpoint, json=payload)
        if not data or not data.get("ok"):
            return {"error": "Failed to send message", "details": data}
            
        return {
            "ts": data.get("ts"),
            "channel": data.get("channel"),
            "message": "Message sent successfully"
        }
