from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import OAuth2ClientCredentialsProvider
from core.config import config

class HRISConnector(BaseConnector):
    """
    Real Connector for Workday HRIS.
    """

    def __init__(self):
        super().__init__()
        if config.WD_CLIENT_ID and config.WD_CLIENT_SECRET:
            # Workday OAuth2 Token URL
            token_url = f"{config.WD_AUTH_URL}/token"
            
            self.auth = OAuth2ClientCredentialsProvider(
                token_url=token_url,
                client_id=config.WD_CLIENT_ID,
                client_secret=config.WD_CLIENT_SECRET
            )
            
            # Base URL for Workday REST API
            # Format: https://wd2-impl-services1.workday.com/ccx/service/customreport2/{tenant}/{user}/{report_name}
            # Or standard REST API: https://{host}/ccx/api/v1/{tenant}
            self.client = APIClient(
                base_url=f"{config.WD_API_URL}/ccx/api/v1/{config.WD_TENANT}",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Workday credentials not found. HRISConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "hris_get_employee",
                "description": "Retrieves employee details from Workday.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "employee_id": {"type": "string", "description": "The Employee ID."},
                        "email": {"type": "string", "description": "Filter by email."}
                    }
                }
            },
            {
                "name": "hris_get_time_off",
                "description": "Retrieves time off balances and requests.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "employee_id": {"type": "string", "description": "The Employee ID."}
                    },
                    "required": ["employee_id"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Workday credentials not configured."

        if tool_name == "hris_get_employee":
            return self._get_employee(kwargs.get("employee_id"), kwargs.get("email"))
        elif tool_name == "hris_get_time_off":
            return self._get_time_off(kwargs.get("employee_id"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_employee(self, employee_id: str = None, email: str = None) -> Dict[str, Any]:
        endpoint = "workers"
        params = {}
        # Workday API filtering might vary, assuming standard REST
        
        data = self.client.get(endpoint, params=params)
        if not data: return {}
        
        # Filter client-side if API doesn't support direct filter in this mock-ish implementation
        workers = data.get("data", [])
        for w in workers:
            if employee_id and w.get("id") == employee_id:
                return w
            if email and w.get("email") == email:
                return w
                
        return {"message": "Employee not found"}

    def _get_time_off(self, employee_id: str) -> Dict[str, Any]:
        endpoint = f"workers/{employee_id}/timeOffBalances"
        data = self.client.get(endpoint)
        if not data: return {"message": "No data found"}
        
        return data
