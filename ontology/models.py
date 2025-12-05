from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Status(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"

class Entity(BaseModel):
    id: str
    source_system: str  # e.g., "SAP", "Salesforce", "ServiceNow"
    source_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Customer(Entity):
    name: str
    email: Optional[str] = None
    segment: str = "Standard"  # e.g., "Strategic", "Enterprise"
    account_manager_id: Optional[str] = None

class Employee(Entity):
    name: str
    email: str
    role: str
    manager_id: Optional[str] = None

class Order(Entity):
    customer_id: str
    amount: float
    currency: str = "USD"
    status: Status
    promised_date: datetime
    items: List[Dict[str, Any]] = []

class Shipment(Entity):
    order_id: str
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    status: Status
    estimated_delivery: datetime
    actual_delivery: Optional[datetime] = None

class Incident(Entity):
    title: str
    description: str
    priority: Priority
    status: Status
    assigned_to_id: Optional[str] = None
    related_entities: List[str] = []  # IDs of related Orders, Shipments, etc.

class Event(BaseModel):
    event_type: str  # e.g., "ShipmentDelayed", "OrderCreated"
    timestamp: datetime = Field(default_factory=datetime.now)
    payload: Dict[str, Any]
    source: str
