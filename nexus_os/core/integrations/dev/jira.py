from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.config import config

class JiraConnector(BaseConnector):
    """
    Connector for Jira (Dev/Ops).
    Supports checking for risky changes and blocking deployments.
    """
    def __init__(self):
        super().__init__()
        self.is_mock = True # Default to mock for now as config might be missing
        # Add real auth logic here if needed using config.ATLASSIAN_*

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "jira_get_risky_changes",
                "description": "Retrieves pending changes/deployments that are flagged as high risk.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "jira_block_deployment",
                "description": "Blocks a deployment ticket and requests a rollback plan.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "ticket_id": {"type": "string", "description": "The Jira Ticket ID."},
                        "reason": {"type": "string", "description": "Reason for blocking."}
                    },
                    "required": ["ticket_id", "reason"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "jira_get_risky_changes":
            return self._get_risky_changes()
        elif tool_name == "jira_block_deployment":
            return self._block_deployment(kwargs.get("ticket_id"), kwargs.get("reason"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_risky_changes(self) -> List[Dict[str, Any]]:
        if self.is_mock:
            return [
                {
                    "id": "PROJ-101",
                    "summary": "Migrate User DB to New Schema",
                    "risk_score": 9,
                    "has_rollback_plan": False,
                    "owner": "dave@company.com"
                },
                {
                    "id": "PROJ-102",
                    "summary": "Update Frontend Assets",
                    "risk_score": 2,
                    "has_rollback_plan": True,
                    "owner": "sarah@company.com"
                }
            ]
        return []

    def _block_deployment(self, ticket_id: str, reason: str) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "ticket_id": ticket_id,
                "status": "BLOCKED",
                "comment_added": reason,
                "owner_notified": True
            }
        return {}
