from typing import List, Dict, Any

SALES_ORDERS = [
    {"id": "SO-1001", "customer_id": "CUST-001", "total_amount": 1500.00, "status": "Open", "items": [{"item_id": "ITEM-A", "qty": 5}, {"item_id": "ITEM-B", "qty": 2}]},
    {"id": "SO-1002", "customer_id": "CUST-002", "total_amount": 500.00, "status": "Shipped", "items": [{"item_id": "ITEM-C", "qty": 1}]},
    {"id": "SO-1003", "customer_id": "CUST-001", "total_amount": 2500.00, "status": "Open", "items": [{"item_id": "ITEM-A", "qty": 10}]},
]

INVENTORY = [
    {"item_id": "ITEM-A", "name": "Widget A", "quantity_on_hand": 100, "location": "Warehouse 1"},
    {"item_id": "ITEM-B", "name": "Widget B", "quantity_on_hand": 50, "location": "Warehouse 1"},
    {"item_id": "ITEM-C", "name": "Gadget C", "quantity_on_hand": 0, "location": "Warehouse 2"},
]

def get_mock_sales_orders(customer_id: str = None) -> List[Dict[str, Any]]:
    if customer_id:
        return [so for so in SALES_ORDERS if so["customer_id"] == customer_id]
    return SALES_ORDERS

def get_mock_inventory(item_id: str = None) -> List[Dict[str, Any]]:
    if item_id:
        return [inv for inv in INVENTORY if inv["item_id"] == item_id]
    return INVENTORY

def create_mock_purchase_order(vendor_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "id": "PO-9999",
        "vendor_id": vendor_id,
        "status": "Draft",
        "items": items,
        "message": "Purchase Order created successfully in draft mode."
    }
