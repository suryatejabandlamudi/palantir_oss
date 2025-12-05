from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.config import config

class WorkdayConnector(BaseConnector):
    """
    Connector for Workday HRIS.
    Supports checking employee stats and time-off balances.
    """
    def __init__(self):
        super().__init__()
        self.is_mock = True

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "wd_get_team_timeoff",
                "description": "Retrieves time-off balances and last leave dates for a team.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "team_id": {"type": "string", "description": "The Team ID."}
                    },
                    "required": ["team_id"]
                }
            },
            {
                "name": "wd_notify_manager",
                "description": "Sends a nudge/notification to a manager.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "manager_id": {"type": "string", "description": "Manager ID."},
                        "message": {"type": "string", "description": "The message content."}
                    },
                    "required": ["manager_id", "message"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "wd_get_team_timeoff":
            return self._get_team_timeoff(kwargs.get("team_id"))
        elif tool_name == "wd_notify_manager":
            return self._notify_manager(kwargs.get("manager_id"), kwargs.get("message"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_team_timeoff(self, team_id: str) -> List[Dict[str, Any]]:
        if self.is_mock:
            return [
                {
                    "employee_id": "EMP-001",
                    "name": "Sarah Connor",
                    "role": "Engineering Lead",
                    "time_off_balance": 120, # High balance
                    "last_leave_date": "2024-05-10", # Long time ago
                    "risk_flag": "High"
                },
                {
                    "employee_id": "EMP-002",
                    "name": "John Doe",
                    "role": "Senior Dev",
                    "time_off_balance": 10,
                    "last_leave_date": "2025-01-05",
                    "risk_flag": "Low"
                }
            ]
        return []

    def _notify_manager(self, manager_id: str, message: str) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "status": "SENT",
                "recipient": manager_id,
                "message": message
            }
        return {}
