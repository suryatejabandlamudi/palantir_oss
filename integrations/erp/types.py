from typing import List, Optional, TypedDict

class SalesOrderLine(TypedDict):
    itemId: str
    quantity: int
    unitPrice: float

class SalesOrder(TypedDict):
    id: str
    number: str
    customerId: str
    customerName: str
    totalAmount: float
    status: str
    lines: List[SalesOrderLine]

class Item(TypedDict):
    id: str
    number: str
    displayName: str
    type: str
    inventory: int
    unitPrice: float
