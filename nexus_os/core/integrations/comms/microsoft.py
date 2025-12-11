from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.config import config

class MicrosoftGraphConnector(BaseConnector):
    """
    Connector for Microsoft Graph (M365).
    Supports checking meeting stats and email patterns.
    """
    def __init__(self):
        super().__init__()
        self.is_mock = True

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "ms_get_meeting_stats",
                "description": "Retrieves meeting statistics for a user to detect overload.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string", "description": "User email."}
                    },
                    "required": ["email"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "ms_get_meeting_stats":
            return self._get_meeting_stats(kwargs.get("email"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_meeting_stats(self, email: str) -> Dict[str, Any]:
        if self.is_mock:
            if "sarah" in email.lower():
                return {
                    "email": email,
                    "weekly_meeting_hours": 35, # Very high
                    "after_hours_meetings": 4,
                    "status": "Overloaded"
                }
            return {
                "email": email,
                "weekly_meeting_hours": 10,
                "after_hours_meetings": 0,
                "status": "Normal"
            }
        return {}
