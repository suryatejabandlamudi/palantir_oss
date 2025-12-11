from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import BasicAuthProvider
from nexus_os.core.config import config

class ITSMConnector(BaseConnector):
    """
    Real Connector for ServiceNow ITSM.
    """

    def __init__(self):
        super().__init__()
        # Try real auth first, fall back to mock DB
        if config.SERVICENOW_URL and config.SERVICENOW_USERNAME and config.SERVICENOW_PASSWORD:
            self.auth = BasicAuthProvider(
                username=config.SERVICENOW_USERNAME,
                token=config.SERVICENOW_PASSWORD
            )
            self.client = APIClient(
                base_url=f"{config.SERVICENOW_URL}/api/now/table",
                auth_provider=self.auth
            )
            self.mock_mode = False
        else:
            print("INFO: ServiceNow credentials not found. Using Mock NexusDB.")
            self.client = None
            self.mock_mode = True
            from nexus_os.core.integrations.db import db
            self.db = db

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
                }
            },
            {
                "name": "itsm_lock_account",
                "description": "Locks a user account in the identity provider (Active Directory/Okta).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string", "description": "The username to lock."},
                        "reason": {"type": "string", "description": "Reason for locking."}
                    },
                    "required": ["username"]
                }
            },
            {
                "name": "itsm_scan_logs",
                "description": "Scans security logs for a specific user.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string", "description": "The username to scan."},
                        "hours": {"type": "integer", "description": "Number of past hours to scan."}
                    },
                    "required": ["username"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "itsm_create_incident":
            return self._create_incident(
                kwargs.get("short_description"),
                kwargs.get("description"),
                kwargs.get("urgency")
            )
        elif tool_name == "itsm_get_ticket_status":
            return self._get_ticket_status(kwargs.get("ticket_number"))
        elif tool_name == "itsm_lock_account":
            return self._lock_account(kwargs.get("username"), kwargs.get("reason"))
        elif tool_name == "itsm_scan_logs":
            return self._scan_logs(kwargs.get("username"), kwargs.get("hours", 24))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _create_incident(self, short_desc: str, desc: str = None, urgency: str = "3") -> Dict[str, Any]:
        if not self.mock_mode:
            # Real API Implementation
            endpoint = "incident"
            payload = {
                "short_description": short_desc,
                "description": desc or short_desc,
                "urgency": urgency,
                "caller_id": "admin"
            }
            data = self.client.post(endpoint, json=payload)
            if not data: return {"error": "Failed to create incident"}
            return {
                "number": data.get("result", {}).get("number"),
                "sys_id": data.get("result", {}).get("sys_id"),
                "state": data.get("result", {}).get("state"),
                "message": "Incident created successfully (Real)"
            }
        else:
            # Mock Implementation (DuckDB)
            import uuid
            import random
            inc_number = f"INC-{random.randint(10000, 99999)}"
            self.db.execute(
                "INSERT INTO incidents (number, short_description, description, urgency, state, assigned_to) VALUES (?, ?, ?, ?, ?, ?)",
                (inc_number, short_desc, desc or short_desc, urgency, 'New', 'Service Desk')
            )
            return {
                "number": inc_number,
                "state": "New",
                "message": "Incident created successfully (Mock)"
            }

    def _get_ticket_status(self, ticket_number: str) -> Dict[str, Any]:
        if not self.mock_mode:
            # Real API Implementation
            endpoint = "incident"
            params = {"sysparm_query": f"number={ticket_number}", "sysparm_limit": 1}
            data = self.client.get(endpoint, params=params)
            if not data or not data.get("result"): return {"message": "Ticket not found"}
            ticket = data["result"][0]
            return {
                "number": ticket.get("number"),
                "state": ticket.get("state"),
                "short_description": ticket.get("short_description"),
                "assigned_to": ticket.get("assigned_to", {}).get("value")
            }
        else:
            # Mock Implementation (DuckDB)
            results = self.db.query("SELECT * FROM incidents WHERE number = ?", (ticket_number,))
            if not results:
                return {"message": "Ticket not found (Mock)"}
            ticket = results[0]
            return ticket

    def _lock_account(self, username: str, reason: str) -> Dict[str, Any]:
        # Simulation of an AD/Okta lock
        return {
            "status": "LOCKED",
            "username": username,
            "timestamp": "Now",
            "reason": reason or "Security Policy Violation"
        }

    def _scan_logs(self, username: str, hours: int) -> Dict[str, Any]:
        # Simulation of a Splunk/SIEM query
        return {
            "status": "SCAN_COMPLETE",
            "findings": [
                {"timestamp": "T-1h", "event": "Login_Success", "location": "Bucharest, RO", "ip": "89.12.44.11"},
                {"timestamp": "T-2h", "event": "File_Download", "file": "customer_db_dump.sql", "size": "4GB"},
                {"timestamp": "T-3h", "event": "Login_Success", "location": "New York, USA", "ip": "10.0.0.5"}
            ],
            "risk_score": 95
        }
