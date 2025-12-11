from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import OAuth2ClientCredentialsProvider
from nexus_os.core.config import config

class CRMConnector(BaseConnector):
    """
    Real Connector for Salesforce CRM & CPQ.
    """

    def __init__(self):
        super().__init__()
        self.use_mock = False
        if config.SALESFORCE_CLIENT_ID and config.SALESFORCE_CLIENT_SECRET:
            try:
                # Salesforce OAuth2 Token URL
                token_url = "https://login.salesforce.com/services/oauth2/token"
                
                self.auth = OAuth2ClientCredentialsProvider(
                    token_url=token_url,
                    client_id=config.SALESFORCE_CLIENT_ID,
                    client_secret=config.SALESFORCE_CLIENT_SECRET
                )
                
                # Base URL for Salesforce REST API
                self.client = APIClient(
                    base_url=f"{config.SALESFORCE_INSTANCE_URL}/services/data/v58.0",
                    auth_provider=self.auth
                )
            except Exception as e:
                print(f"Warning: Salesforce init failed, falling back to Mock DB. {e}")
                self.use_mock = True
        else:
            # print("WARNING: Salesforce credentials not found. Using DuckDB for simulation.")
            self.use_mock = True
            
        if self.use_mock:
            from nexus_os.core.integrations.db import db
            self.db = db

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "crm_get_leads",
                "description": "Retrieves a list of leads from Salesforce.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string", "description": "Filter by email."}
                    }
                }
            },
            {
                "name": "crm_get_opportunities",
                "description": "Retrieves a list of opportunities.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_id": {"type": "string", "description": "Filter by Account ID."}
                    }
                }
            },
            {
                "name": "crm_create_quote",
                "description": "Creates a CPQ Quote for an Opportunity.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "opportunity_id": {"type": "string", "description": "The Opportunity ID."},
                        "products": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "productId": {"type": "string"},
                                    "quantity": {"type": "number"}
                                }
                            }
                        }
                    },
                    "required": ["opportunity_id", "products"]
                }
            }
            {
                "name": "crm_get_competitor_info",
                "description": "Retrieves competitor intelligence.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "competitor_name": {"type": "string"}
                    },
                    "required": ["competitor_name"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        # if not self.client and not self.use_mock:
        #     return "Error: Salesforce credentials not configured."

        if tool_name == "crm_get_leads":
            return self._get_leads(kwargs.get("email"))
        elif tool_name == "crm_get_opportunities":
            return self._get_opportunities(kwargs.get("account_id"))
        elif tool_name == "crm_create_quote":
            return self._create_quote(kwargs.get("opportunity_id"), kwargs.get("products"))
        elif tool_name == "crm_get_competitor_info":
             return self._get_competitor_info(kwargs.get("competitor_name"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_leads(self, email: str = None) -> List[Dict[str, Any]]:
        if self.use_mock:
            sql = "SELECT id as Id, name as Name, email as Email, company as Company, status as Status FROM leads"
            params = []
            if email:
                sql += " WHERE email = ?"
                params.append(email)
            return self.db.query(sql, tuple(params))
            
        endpoint = "sobjects/Lead"
        query = "SELECT Id, Name, Email, Company, Status FROM Lead"
        if email:
            query += f" WHERE Email = '{email}'"
        
        return self._run_soql(query)

    def _get_opportunities(self, account_id: str = None) -> List[Dict[str, Any]]:
        if self.use_mock:
            sql = "SELECT id as Id, name as Name, stage as StageName, amount as Amount, close_date as CloseDate FROM opportunities"
            params = []
            if account_id:
                sql += " WHERE account_id = ?"
                params.append(account_id)
            return self.db.query(sql, tuple(params))

        query = "SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity"
        if account_id:
            query += f" WHERE AccountId = '{account_id}'"
            
        return self._run_soql(query)

    def _create_quote(self, opportunity_id: str, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        if self.use_mock:
            import uuid
            quote_id = f"Q-{str(uuid.uuid4())[:8]}"
            # We don't have a quote table yet, but we'll simulate success
            # and maybe log it if we add a quotes table later.
            return {
                "id": quote_id,
                "status": "Draft",
                "lineItems": products,
                "message": "Quote created in NexusDB (Simulated)"
            }

        # 1. Create Quote Object (Standard Quote or CPQ Quote)
        # Assuming Standard Quote for simplicity
        endpoint = "sobjects/Quote"
        payload = {
            "OpportunityId": opportunity_id,
            "Name": f"Quote for Opp {opportunity_id}"
        }
        quote_res = self.client.post(endpoint, json=payload)
        if not quote_res or not quote_res.get("success"):
            return {"error": "Failed to create Quote", "details": quote_res}
            
        quote_id = quote_res.get("id")
        
        # 2. Add Line Items (QuoteLineItem)
        # Note: Requires PricebookEntryId usually, simplifying here
        line_items = []
        for p in products:
            # In real world, we'd look up PricebookEntryId from ProductId
            line_payload = {
                "QuoteId": quote_id,
                "Product2Id": p["productId"],
                "Quantity": p["quantity"],
                "UnitPrice": 100.0 # Placeholder
            }
            # self.client.post("sobjects/QuoteLineItem", json=line_payload)
            line_items.append(line_payload)
            
        return {
            "id": quote_id,
            "status": "Draft",
            "lineItems": line_items,
            "message": "Quote created (Line items simulated)"
        }

    def _run_soql(self, query: str) -> List[Dict[str, Any]]:
        endpoint = "query"
        params = {"q": query}
        data = self.client.get(endpoint, params=params)
        if not data: return []
        return data.get("records", [])

    def _get_competitor_info(self, competitor_name):
        # Mock Logic
        return {
            "name": competitor_name,
            "win_rate_against": "35%",
            "common_objections": ["Price", "Complexity"],
            "recent_news": "Released new AI feature Q3"
        }
