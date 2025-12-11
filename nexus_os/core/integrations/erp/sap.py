from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import BasicAuthProvider
from nexus_os.core.config import config

class SAPConnector(BaseConnector):
    """
    Real Connector for SAP S/4HANA (OData).
    """

    def __init__(self):
        super().__init__()
        if config.SAP_URL and config.SAP_USERNAME and config.SAP_PASSWORD:
            self.auth = BasicAuthProvider(
                username=config.SAP_USERNAME,
                token=config.SAP_PASSWORD
            )
            
            # Base URL for SAP OData API
            # e.g., https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap
            self.client = APIClient(
                base_url=config.SAP_URL,
                auth_provider=self.auth
            )
        else:
            print("WARNING: SAP credentials not found. SAPConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "sap_get_product_master",
                "description": "Retrieves product master data from SAP.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string", "description": "Product Number (Material Number)."}
                    },
                    "required": ["product_id"]
                }
            },
            {
                "name": "sap_create_sales_order",
                "description": "Creates a Sales Order in SAP.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {"type": "string", "description": "Sold-To Party."},
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "material": {"type": "string"},
                                    "quantity": {"type": "number"}
                                }
                            }
                        }
                    },
                    "required": ["customer_id", "items"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: SAP credentials not configured."

        if tool_name == "sap_get_product_master":
            return self._get_product(kwargs.get("product_id"))
        elif tool_name == "sap_create_sales_order":
            return self._create_sales_order(kwargs.get("customer_id"), kwargs.get("items"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_product(self, product_id: str) -> Dict[str, Any]:
        # API_PRODUCT_SRV/A_Product
        endpoint = "API_PRODUCT_SRV/A_Product"
        params = {
            "$filter": f"Product eq '{product_id}'",
            "$format": "json"
        }
        
        data = self.client.get(endpoint, params=params)
        if not data or not data.get("d", {}).get("results"):
            return {"message": "Product not found"}
            
        product = data["d"]["results"][0]
        return {
            "Product": product.get("Product"),
            "ProductType": product.get("ProductType"),
            "CreationDate": product.get("CreationDate")
        }

    def _create_sales_order(self, customer_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        # API_SALES_ORDER_SRV/A_SalesOrder
        endpoint = "API_SALES_ORDER_SRV/A_SalesOrder"
        
        # NOTE: SAP OData deep insert payload structure is complex. Simplified here.
        payload = {
            "SalesOrderType": "OR",
            "SoldToParty": customer_id,
            "to_Item": []
        }
        
        for item in items:
            payload["to_Item"].append({
                "Material": item["material"],
                "RequestedQuantity": str(item["quantity"])
            })
            
        data = self.client.post(endpoint, json=payload)
        
        # SAP OData usually returns the entry in 'd'
        if not data: return {"error": "Failed to create Sales Order"}
        
        return {
            "SalesOrder": data.get("d", {}).get("SalesOrder"),
            "message": "Sales Order created successfully"
        }
