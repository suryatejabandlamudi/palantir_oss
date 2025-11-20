from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import BasicAuthProvider
from core.config import config

class ITSMConnector(BaseConnector):
    """
    Real Connector for ServiceNow ITSM.
    """

    def __init__(self):
        super().__init__()
        if config.SN_INSTANCE and config.SN_USERNAME and config.SN_PASSWORD:
            # ServiceNow usually uses Basic Auth for API
            self.auth = BasicAuthProvider(
                username=config.SN_USERNAME,
                token=config.SN_PASSWORD
            )
            
            # Base URL for ServiceNow Table API
            # Format: https://{instance}.service-now.com/api/now/table
            self.client = APIClient(
                base_url=f"https://{config.SN_INSTANCE}.service-now.com/api/now/table",
                auth_provider=self.auth
            )
        else:
            print("WARNING: ServiceNow credentials not found. ITSMConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "itsm_create_incident",
                "description": "Creates a new incident in ServiceNow.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "short_description": {"type": "string", "description": "Brief summary of the issue."},
                        "description": {"type": "string", "description": "Detailed description."},
                        "urgency": {"type": "string", "enum": ["1", "2", "3"], "description": "1=High, 2=Medium, 3=Low"}
                    },
                    "required": ["short_description"]
                }
            },
            {
                "name": "itsm_get_ticket_status",
                "description": "Retrieves the status of a ticket.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "ticket_number": {"type": "string", "description": "The ticket number (e.g., INC0012345)."}
                    },
                    "required": ["ticket_number"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: ServiceNow credentials not configured."

        if tool_name == "itsm_create_incident":
            return self._create_incident(
                kwargs.get("short_description"),
                kwargs.get("description"),
                kwargs.get("urgency")
            )
        elif tool_name == "itsm_get_ticket_status":
            return self._get_ticket_status(kwargs.get("ticket_number"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _create_incident(self, short_desc: str, desc: str = None, urgency: str = "3") -> Dict[str, Any]:
        endpoint = "incident"
        payload = {
            "short_description": short_desc,
            "description": desc or short_desc,
            "urgency": urgency,
            "caller_id": "admin" # Defaulting to admin for now
        }
        
        data = self.client.post(endpoint, json=payload)
        if not data: return {"error": "Failed to create incident"}
        
        return {
            "number": data.get("result", {}).get("number"),
            "sys_id": data.get("result", {}).get("sys_id"),
            "state": data.get("result", {}).get("state"),
            "message": "Incident created successfully"
        }

    def _get_ticket_status(self, ticket_number: str) -> Dict[str, Any]:
        endpoint = "incident"
        params = {
            "sysparm_query": f"number={ticket_number}",
            "sysparm_limit": 1
        }
        
        data = self.client.get(endpoint, params=params)
        if not data or not data.get("result"):
            return {"message": "Ticket not found"}
            
        ticket = data["result"][0]
        return {
            "number": ticket.get("number"),
            "state": ticket.get("state"), # State is usually an integer, might need mapping
            "short_description": ticket.get("short_description"),
            "assigned_to": ticket.get("assigned_to", {}).get("value")
        }
