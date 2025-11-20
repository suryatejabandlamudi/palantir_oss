from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import OAuth2ClientCredentialsProvider
from core.config import config

class ERPConnector(BaseConnector):
    """
    Real Connector for Dynamics 365 Business Central.
    Uses OAuth2 Client Credentials flow.
    """

    def __init__(self):
        super().__init__()
        if config.D365_TENANT_ID and config.D365_CLIENT_ID and config.D365_CLIENT_SECRET:
            token_url = f"https://login.microsoftonline.com/{config.D365_TENANT_ID}/oauth2/v2.0/token"
            scope = "https://api.businesscentral.dynamics.com/.default"
            
            self.auth = OAuth2ClientCredentialsProvider(
                token_url=token_url,
                client_id=config.D365_CLIENT_ID,
                client_secret=config.D365_CLIENT_SECRET,
                scope=scope
            )
            
            # Base URL for D365 BC OData V4 or API v2.0
            # Format: https://api.businesscentral.dynamics.com/v2.0/{tenant_id}/{environment}/api/v2.0
            self.client = APIClient(
                base_url=f"https://api.businesscentral.dynamics.com/v2.0/{config.D365_TENANT_ID}/{config.D365_ENVIRONMENT}/api/v2.0",
                auth_provider=self.auth
            )
        else:
            print("WARNING: D365 credentials not found. ERPConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "erp_get_sales_orders",
                "description": "Retrieves a list of sales orders from Dynamics 365, optionally filtered by customer ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "type": "string",
                            "description": "The ID of the customer to filter by."
                        }
                    }
                }
            },
            {
                "name": "erp_get_inventory",
                "description": "Checks inventory levels for items.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "item_id": {
                            "type": "string",
                            "description": "The ID or name of the item to check."
                        }
                    }
                }
            },
            {
                "name": "erp_get_general_ledger",
                "description": "Retrieves General Ledger (GL) entries.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_no": {"type": "string", "description": "Filter by G/L Account Number."}
                    }
                }
            },
            {
                "name": "erp_get_payables",
                "description": "Retrieves Accounts Payable (Vendor Invoices).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "vendor_id": {"type": "string", "description": "Filter by Vendor ID."}
                    }
                }
            },
            {
                "name": "erp_get_receivables",
                "description": "Retrieves Accounts Receivable (Customer Invoices).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string", "description": "Filter by Customer ID."}
                    }
                }
            },
            {
                "name": "erp_create_po",
                "description": "Creates a Purchase Order.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "vendor_id": {"type": "string", "description": "The Vendor ID."},
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "itemId": {"type": "string"},
                                    "quantity": {"type": "number"}
                                }
                            }
                        }
                    },
                    "required": ["vendor_id", "items"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: D365 credentials not configured."

        if tool_name == "erp_get_sales_orders":
            return self._get_sales_orders(kwargs.get("customer_id"))
        elif tool_name == "erp_get_inventory":
            return self._get_inventory(kwargs.get("item_id"))
        elif tool_name == "erp_get_general_ledger":
            return self._get_general_ledger(kwargs.get("account_no"))
        elif tool_name == "erp_get_payables":
            return self._get_payables(kwargs.get("vendor_id"))
        elif tool_name == "erp_get_receivables":
            return self._get_receivables(kwargs.get("customer_id"))
        elif tool_name == "erp_create_po":
            return self._create_purchase_order(kwargs.get("vendor_id"), kwargs.get("items"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_general_ledger(self, account_no: str = None) -> List[Dict[str, Any]]:
        endpoint = "generalLedgerEntries"
        params = {}
        if account_no:
            params["$filter"] = f"accountNumber eq '{account_no}'"
        
        data = self.client.get(endpoint, params=params)
        if not data: return []
        
        return data.get("value", [])

    def _get_sales_orders(self, customer_id: str = None) -> List[Dict[str, Any]]:
        endpoint = "salesOrders"
        params = {}
        if customer_id:
            params["$filter"] = f"customerId eq '{customer_id}'"
        
        data = self.client.get(endpoint, params=params)
        if not data:
            return []
            
        # Map D365 response to our simplified schema
        orders = []
        for item in data.get("value", []):
            orders.append({
                "id": item.get("id"),
                "number": item.get("number"),
                "customerId": item.get("customerId"),
                "customerName": item.get("customerName"),
                "totalAmount": item.get("totalAmountIncludingTax"),
                "status": item.get("status")
            })
        return orders

    def _get_inventory(self, item_id: str = None) -> List[Dict[str, Any]]:
        endpoint = "items"
        params = {}
        if item_id:
            # Simple contains search on displayName or exact match on number
            params["$filter"] = f"contains(displayName,'{item_id}') or number eq '{item_id}'"
            
        data = self.client.get(endpoint, params=params)
        if not data:
            return []
            
        items = []
        for item in data.get("value", []):
            items.append({
                "id": item.get("id"),
                "number": item.get("number"),
                "displayName": item.get("displayName"),
                "inventory": item.get("inventory"),
                "unitPrice": item.get("unitPrice")
            })
        return items

    def _get_payables(self, vendor_id: str = None) -> List[Dict[str, Any]]:
        """
        Fetch vendor invoices (Accounts Payable).
        """
        endpoint = "purchaseInvoices"
        params = {}
        if vendor_id:
            params["$filter"] = f"vendorId eq '{vendor_id}'"
            
        data = self.client.get(endpoint, params=params)
        if not data: return []
        
        invoices = []
        for item in data.get("value", []):
            invoices.append({
                "id": item.get("id"),
                "number": item.get("number"),
                "vendorId": item.get("vendorId"),
                "vendorName": item.get("vendorName"),
                "totalAmount": item.get("totalAmountIncludingTax"),
                "dueDate": item.get("dueDate"),
                "status": item.get("status")
            })
        return invoices

    def _get_receivables(self, customer_id: str = None) -> List[Dict[str, Any]]:
        """
        Fetch customer invoices (Accounts Receivable).
        """
        endpoint = "salesInvoices"
        params = {}
        if customer_id:
            params["$filter"] = f"customerId eq '{customer_id}'"
            
        data = self.client.get(endpoint, params=params)
        if not data: return []
        
        invoices = []
        for item in data.get("value", []):
            invoices.append({
                "id": item.get("id"),
                "number": item.get("number"),
                "customerId": item.get("customerId"),
                "customerName": item.get("customerName"),
                "totalAmount": item.get("totalAmountIncludingTax"),
                "dueDate": item.get("dueDate"),
                "status": item.get("status")
            })
        return invoices

    def _create_purchase_order(self, vendor_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create a Purchase Order.
        items: List of dicts with 'itemId' and 'quantity'.
        """
        # 1. Create Header
        endpoint = "purchaseOrders"
        payload = {
            "vendorId": vendor_id
        }
        po_data = self.client.post(endpoint, json=payload)
        if not po_data:
            return {"error": "Failed to create PO header"}
            
        po_id = po_data.get("id")
        
        # 2. Add Lines
        lines_endpoint = f"purchaseOrders({po_id})/purchaseOrderLines"
        created_lines = []
        for item in items:
            line_payload = {
                "itemId": item["itemId"],
                "quantity": item["quantity"]
            }
            line_res = self.client.post(lines_endpoint, json=line_payload)
            if line_res:
                created_lines.append(line_res)
                
        return {
            "id": po_id,
            "number": po_data.get("number"),
            "vendorId": vendor_id,
            "lines": created_lines
        }
