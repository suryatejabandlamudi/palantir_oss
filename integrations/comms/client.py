from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import OAuth2ClientCredentialsProvider
from core.config import config

try:
    from slack_sdk import WebClient
    from slack_sdk.errors import SlackApiError
except ImportError:
    WebClient = None

class CommsConnector(BaseConnector):
    """
    Real Connector for Microsoft Graph (Teams) and Slack.
    """

    def __init__(self):
        super().__init__()
        # Microsoft Graph Init
        if config.GRAPH_TENANT_ID and config.GRAPH_CLIENT_ID and config.GRAPH_CLIENT_SECRET:
            token_url = f"https://login.microsoftonline.com/{config.GRAPH_TENANT_ID}/oauth2/v2.0/token"
            scope = "https://graph.microsoft.com/.default"
            
            self.auth = OAuth2ClientCredentialsProvider(
                token_url=token_url,
                client_id=config.GRAPH_CLIENT_ID,
                client_secret=config.GRAPH_CLIENT_SECRET,
                scope=scope
            )
            self.client = APIClient(
                base_url="https://graph.microsoft.com/v1.0",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Microsoft Graph credentials not found.")
            self.client = None

        # Slack Init
        if config.SLACK_BOT_TOKEN:
            if WebClient:
                self.slack_client = WebClient(token=config.SLACK_BOT_TOKEN)
            else:
                print("WARNING: 'slack_sdk' not installed.")
                self.slack_client = None
        else:
            print("WARNING: Slack credentials not found.")
            self.slack_client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "comms_send_message",
                "description": "Sends a message to a Microsoft Teams channel.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "team_id": {
                            "type": "string",
                            "description": "The ID of the Team."
                        },
                        "channel_id": {
                            "type": "string",
                            "description": "The ID of the Channel."
                        },
                        "message": {
                            "type": "string",
                            "description": "The content of the message."
                        }
                    },
                    "required": ["team_id", "channel_id", "message"]
                }
            },
            {
                "name": "comms_get_channel_history",
                "description": "Retrieves recent messages from a channel.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "team_id": {"type": "string"},
                        "channel_id": {"type": "string"}
                    },
                    "required": ["team_id", "channel_id"]
                }
            }
            {
                "name": "comms_send_slack_message",
                "description": "Sends a message to a Slack channel.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "channel": {
                            "type": "string",
                            "description": "The channel name (e.g. #general) or ID."
                        },
                        "text": {
                            "type": "string",
                            "description": "The message content."
                        }
                    },
                    "required": ["channel", "text"]
                }
            }
            {
                "name": "comms_send_email",
                "description": "Sends an email using Microsoft Outlook (Graph API).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {"type": "string", "description": "Recipient email address."},
                        "subject": {"type": "string", "description": "Email subject."},
                        "body": {"type": "string", "description": "Email body content."}
                    },
                    "required": ["to", "subject", "body"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "comms_send_message":
            if not self.client: return "Error: MS Graph not configured."
            return self._send_message(kwargs.get("team_id"), kwargs.get("channel_id"), kwargs.get("message"))
        elif tool_name == "comms_get_channel_history":
            if not self.client: return "Error: MS Graph not configured."
            return self._get_channel_history(kwargs.get("team_id"), kwargs.get("channel_id"))
        elif tool_name == "comms_send_slack_message":
            return self._send_slack_message(kwargs.get("channel"), kwargs.get("text"))
        elif tool_name == "comms_send_email":
            if not self.client: return "Error: MS Graph not configured."
            return self._send_email(kwargs.get("to"), kwargs.get("subject"), kwargs.get("body"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _send_email(self, to: str, subject: str, body: str) -> Dict[str, Any]:
        endpoint = "users/me/sendMail"
        payload = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "Text",
                    "content": body
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": to
                        }
                    }
                ]
            },
            "saveToSentItems": "true"
        }
        return self.client.post(endpoint, data=payload)

    def _send_message(self, team_id: str, channel_id: str, message: str) -> Dict[str, Any]:
        endpoint = f"teams/{team_id}/channels/{channel_id}/messages"
        payload = {
            "body": {
                "content": message
            }
        }
        return self.client.post(endpoint, data=payload)

    def _get_channel_history(self, team_id: str, channel_id: str) -> List[Dict[str, Any]]:
        endpoint = f"teams/{team_id}/channels/{channel_id}/messages"
        data = self.client.get(endpoint)
        
        if not data:
            return []
            
        messages = []
        for item in data.get("value", []):
            messages.append({
                "id": item.get("id"),
                "content": item.get("body", {}).get("content"),
                "sender": item.get("from", {}).get("user", {}).get("displayName"),
                "createdDateTime": item.get("createdDateTime")
            })
        return messages

    def _send_slack_message(self, channel: str, text: str) -> Dict[str, Any]:
        if not self.slack_client:
            return "Error: Slack not configured or library missing."
        
        try:
            response = self.slack_client.chat_postMessage(channel=channel, text=text)
            return {"ok": response["ok"], "ts": response["ts"]}
        except Exception as e:
            return f"Error sending Slack message: {e}"
