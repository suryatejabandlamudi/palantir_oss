from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import BasicAuthProvider
from core.config import config
import datetime

class SAPConnector(BaseConnector):
    """
    Connector for SAP ERP (S/4HANA or ECC).
    Supports real connection via OData/REST if configured, otherwise mocks data for demo.
    """

    def __init__(self):
        super().__init__()
        self.is_mock = True
        if config.SAP_URL and config.SAP_USERNAME and config.SAP_PASSWORD:
            self.is_mock = False
            self.auth = BasicAuthProvider(
                username=config.SAP_USERNAME,
                token=config.SAP_PASSWORD
            )
            self.client = APIClient(
                base_url=config.SAP_URL,
                auth_provider=self.auth
            )
        else:
            print("WARNING: SAP credentials not found. Using MOCK data for SAP.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "sap_get_orders_by_component",
                "description": "Finds all sales orders that contain a specific component or product.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "component_id": {
                            "type": "string",
                            "description": "The ID of the component (e.g., 'COMP-123')."
                        }
                    },
                    "required": ["component_id"]
                }
            },
            {
                "name": "sap_update_delivery_date",
                "description": "Updates the committed delivery date for a sales order.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_id": {
                            "type": "string",
                            "description": "The Sales Order ID."
                        },
                        "new_date": {
                            "type": "string",
                            "description": "The new delivery date (YYYY-MM-DD)."
                        }
                    },
                    "required": ["order_id", "new_date"]
                }
            },
            {
                "name": "sap_get_shipment_details",
                "description": "Retrieves details for a specific shipment.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "shipment_id": {
                            "type": "string",
                            "description": "The Shipment ID."
                        }
                    },
                    "required": ["shipment_id"]
                }
            },
            {
                "name": "sap_get_ar_aging",
                "description": "Retrieves Accounts Receivable aging report.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "sap_get_ap_aging",
                "description": "Retrieves Accounts Payable aging report (Vendor Invoices).",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "sap_get_orders_by_component":
            return self._get_orders_by_component(kwargs.get("component_id"))
        elif tool_name == "sap_update_delivery_date":
            return self._update_delivery_date(kwargs.get("order_id"), kwargs.get("new_date"))
        elif tool_name == "sap_get_shipment_details":
            return self._get_shipment_details(kwargs.get("shipment_id"))
        elif tool_name == "sap_get_ar_aging":
            return self._get_ar_aging()
        elif tool_name == "sap_get_ap_aging":
            return self._get_ap_aging()
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_ar_aging(self) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "total_receivables": 5000000.0,
                "0_30_days": 3000000.0,
                "31_60_days": 1500000.0,
                "61_90_days": 400000.0,
                "90_plus_days": 100000.0,
                "risk_accounts": ["CUST-SMALL-1", "CUST-RISK-2"]
            }
        # Real implementation would query FI-AR
        return {}

    def _get_ap_aging(self) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "total_payables": 4000000.0,
                "due_next_7_days": 1200000.0,
                "due_next_14_days": 800000.0,
                "vendors": [
                    {"vendor_id": "V-INTEL", "amount": 500000.0, "due_date": "2025-10-05"},
                    {"vendor_id": "V-AMD", "amount": 300000.0, "due_date": "2025-10-08"},
                    {"vendor_id": "V-TSMC", "amount": 400000.0, "due_date": "2025-10-10"}
                ]
            }
        # Real implementation would query FI-AP
        return {}

    def _get_orders_by_component(self, component_id: str) -> List[Dict[str, Any]]:
        if self.is_mock:
            # Mock data for "Component X" scenario
            if component_id in ["COMP-X", "WAFER-Z"]:
                return [
                    {
                        "order_id": "SO-1001",
                        "customer_id": "CUST-APPLE",
                        "customer_name": "Apple Inc.",
                        "amount": 500000.00,
                        "currency": "USD",
                        "status": "OPEN",
                        "promised_date": "2025-10-15",
                        "items": [{"item_id": component_id, "quantity": 1000}]
                    },
                    {
                        "order_id": "SO-1002",
                        "customer_id": "CUST-TESLA",
                        "customer_name": "Tesla Inc.",
                        "amount": 1200000.00,
                        "currency": "USD",
                        "status": "OPEN",
                        "promised_date": "2025-10-12",
                        "items": [{"item_id": component_id, "quantity": 5000}]
                    }
                ]
            return []
        
        # Real implementation would go here (OData query)
        endpoint = "SalesOrderItems"
        params = {"$filter": f"Material eq '{component_id}'"}
        data = self.client.get(endpoint, params=params)
        return data.get("d", {}).get("results", [])

    def _update_delivery_date(self, order_id: str, new_date: str) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "order_id": order_id,
                "status": "UPDATED",
                "old_date": "2025-10-15",
                "new_date": new_date,
                "message": f"Delivery date for {order_id} updated to {new_date} successfully."
            }
        
        # Real implementation
        endpoint = f"SalesOrders('{order_id}')"
        payload = {"RequestedDeliveryDate": f"/Date({new_date})/"} # SAP OData format varies
        res = self.client.patch(endpoint, json=payload)
        return {"status": "UPDATED", "response": res}

    def _get_shipment_details(self, shipment_id: str) -> Dict[str, Any]:
        if self.is_mock:
            return {
                "shipment_id": shipment_id,
                "status": "DELAYED",
                "carrier": "DHL",
                "tracking_number": "1234567890",
                "estimated_delivery": "2025-10-20"
            }
        return {}
