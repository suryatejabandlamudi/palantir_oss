from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import OAuth2ClientCredentialsProvider
from nexus_os.core.config import config

class ERPConnector(BaseConnector):
    """
    Real Connector for Dynamics 365 Business Central.
    Uses OAuth2 Client Credentials flow.
    """

    def __init__(self):
        super().__init__()
        self.use_mock = False
        if config.D365_TENANT_ID and config.D365_CLIENT_ID and config.D365_CLIENT_SECRET:
            try:
                token_url = f"https://login.microsoftonline.com/{config.D365_TENANT_ID}/oauth2/v2.0/token"
                scope = "https://api.businesscentral.dynamics.com/.default"
                
                self.auth = OAuth2ClientCredentialsProvider(
                    token_url=token_url,
                    client_id=config.D365_CLIENT_ID,
                    client_secret=config.D365_CLIENT_SECRET,
                    scope=scope
                )
                
                # Base URL for D365 BC OData V4 or API v2.0
                self.client = APIClient(
                    base_url=f"https://api.businesscentral.dynamics.com/v2.0/{config.D365_TENANT_ID}/{config.D365_ENVIRONMENT}/api/v2.0",
                    auth_provider=self.auth
                )
            except Exception as e:
                 print(f"Warning: D365 init failed, falling back to Mock DB. {e}")
                 self.use_mock = True
        else:
            # print("WARNING: D365 credentials not found. Using DuckDB for simulation.")
            self.use_mock = True
            
        if self.use_mock:
            from nexus_os.core.integrations.db import db
            self.db = db

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
            {
                "name": "erp_check_price_cost",
                "description": "Checks the margin between sales price and ERP cost.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string"}
                    },
                    "required": ["product_id"]
                }
            },
            {
                "name": "erp_check_schedule",
                "description": "Checks production schedule and ATP (Available to Promise).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sku": {"type": "string"},
                        "date": {"type": "string"}
                    },
                    "required": ["sku"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        # if not self.client and not self.use_mock:
        #    return "Error: D365 credentials not configured."

        if tool_name == "erp_get_sales_orders":
            return self._get_sales_orders(kwargs.get("customer_id"))
        elif tool_name == "erp_get_inventory":
            return self._get_inventory(kwargs.get("item_id"))
        elif tool_name == "erp_create_po":
            return self._create_purchase_order(kwargs.get("vendor_id"), kwargs.get("items"))
        elif tool_name == "erp_check_price_cost":
            return self._check_price_cost(kwargs.get("product_id"))
        elif tool_name == "erp_check_schedule":
            return self._check_schedule(kwargs.get("sku"), kwargs.get("date"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_general_ledger(self, account_no: str = None) -> List[Dict[str, Any]]:
        return [] # TODO: Implement DB table for GL if needed

    def _get_sales_orders(self, customer_id: str = None) -> List[Dict[str, Any]]:
        # TODO: Implement DB table for Sales Orders
        return []

    def _get_inventory(self, item_id: str = None) -> List[Dict[str, Any]]:
        if self.use_mock:
            sql = "SELECT material_id as id, description as displayName, plant as location, stock as inventory, status FROM inventory"
            params = []
            if item_id:
                # Basic fuzzy search for DB
                sql += " WHERE material_id LIKE ? OR description LIKE ?"
                params.append(f"%{item_id}%")
                params.append(f"%{item_id}%")
            
            results = self.db.query(sql, tuple(params))
            # Format to match tool expectations
            return results

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

    def _create_purchase_order(self, vendor_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create a Purchase Order.
        items: List of dicts with 'itemId' and 'quantity'.
        """
        if self.use_mock:
            import uuid
            po_id = f"PO-{str(uuid.uuid4())[:8]}"
            
            for item in items:
                self.db.execute("INSERT INTO purchase_orders (id, material_id, quantity, vendor, status) VALUES (?, ?, ?, ?, ?)", 
                               (po_id, item['itemId'], item['quantity'], vendor_id, 'Released'))
                
                # Update inventory logic (simple decrement or increment depending on PO type, usually PO increases stock on receipt, here we just assume it's ordered)
                # For demo purposes, let's say "Immediate Delivery" updates stock
                # self.db.execute("UPDATE inventory SET stock = stock + ? WHERE material_id = ?", (item['quantity'], item['itemId']))

            return {
                "id": po_id,
                "vendorId": vendor_id,
                "lines": items,
                "message": "Purchase Order Created in NexusDB (Simulated)"
            }

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

    def _check_price_cost(self, product_id):
        # Mock Logic for Margin Guardrails
        return {
             "product_id": product_id,
             "list_price": 100.00,
             "cost_of_goods": 45.00,
             "margin_percent": 55,
             "currency": "USD"
        }

    def _check_schedule(self, sku, date):
        # Mock Logic for ATP
        return {
            "sku": sku,
            "requested_date": date,
            "available_quantity": 120,
            "next_production_run": "2025-01-15",
            "status": "AVAILABLE"
        }
