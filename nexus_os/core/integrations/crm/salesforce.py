from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import OAuth2ClientCredentialsProvider
from nexus_os.core.config import config
import datetime

class SalesforceConnector(BaseConnector):
    """
    Connector for Salesforce CRM.
    Supports real connection via REST API if configured, otherwise mocks data.
    """

    def __init__(self):
        super().__init__()
        self.is_mock = True
        if config.SALESFORCE_INSTANCE_URL and config.SALESFORCE_CLIENT_ID and config.SALESFORCE_CLIENT_SECRET:
            self.is_mock = False
            token_url = "https://login.salesforce.com/services/oauth2/token"
            self.auth = OAuth2ClientCredentialsProvider(
                token_url=token_url,
                client_id=config.SALESFORCE_CLIENT_ID,
                client_secret=config.SALESFORCE_CLIENT_SECRET
            )
            self.client = APIClient(
                base_url=f"{config.SALESFORCE_INSTANCE_URL}/services/data/v58.0",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Salesforce credentials not found. Using MOCK data for Salesforce.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "crm_get_account_details",
                "description": "Retrieves details for a specific account (customer).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_name": {
                            "type": "string",
                            "description": "The name of the account to search for."
                        }
                    },
                    "required": ["account_name"]
                }
            },
            {
                "name": "crm_get_commit_forecast",
                "description": "Retrieves the committed deal forecast for the current quarter.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "crm_get_account_details":
            return self._get_account_details(kwargs.get("account_name"))
        elif tool_name == "crm_get_commit_forecast":
            return self._get_commit_forecast()
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_account_details(self, account_name: str) -> Dict[str, Any]:
        if self.is_mock:
            if "Tesla" in account_name:
                return {
                    "Id": "ACC-001",
                    "Name": "Tesla Inc.",
                    "Type": "Strategic Partner",
                    "AnnualRevenue": 80000000000,
                    "AccountManager": "Elon M."
                }
            elif "Apple" in account_name:
                return {
                    "Id": "ACC-002",
                    "Name": "Apple Inc.",
                    "Type": "Customer",
                    "AnnualRevenue": 300000000000,
                    "AccountManager": "Tim C."
                }
            return {}
        
        # Real implementation
        query = f"SELECT Id, Name, Type, AnnualRevenue FROM Account WHERE Name LIKE '%{account_name}%' LIMIT 1"
        return self._run_soql(query)

    def _get_commit_forecast(self) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "quarter": "Q4 2025",
                "commit_amount": 15000000.0,
                "best_case": 20000000.0,
                "pipeline_coverage": 3.5
            }
        
        # Real implementation (simplified)
        query = "SELECT SUM(Amount) FROM Opportunity WHERE StageName = 'Closed Won' OR StageName = 'Commit'"
        return self._run_soql(query)

    def _run_soql(self, query: str) -> Any:
        endpoint = "query"
        params = {"q": query}
        data = self.client.get(endpoint, params=params)
        if not data: return {}
        return data.get("records", [])
