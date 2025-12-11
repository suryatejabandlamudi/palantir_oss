from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import random
from datetime import datetime, timedelta
from .mock_state import mock_state

router = APIRouter(
    prefix="/mock",
    tags=["Enterprise Mocks"]
)

# --- SAP S/4HANA Mocks ---

@router.get("/sap/inventory")
def get_sap_inventory(material_id: Optional[str] = None):
    """
    Mock SAP S/4HANA Inventory Check (API_MATERIAL_STOCK_SRV)
    Retrieves stateful inventory data.
    """
    return mock_state.get_inventory(material_id)

class PurchaseOrder(BaseModel):
    material_id: str
    quantity: int
    supplier_id: str

@router.post("/sap/purchase-order")
def create_sap_po(po: PurchaseOrder):
    """
    Mock SAP S/4HANA Purchase Order Creation (API_PURCHASEORDER_PROCESS_SRV)
    Creates a PO and persists it.
    """
    # Create PO
    new_po = mock_state.create_po(po.material_id, po.quantity, po.supplier_id)
    
    # Auto-replenish logic for demo flow (optional: can be separate "Receive Goods" step)
    # For this demo, let's assume immediate "Expedited" shipping updates the stock 
    # so the user sees the effect immediately after asking "Fix it".
    mock_state.update_inventory(po.material_id, po.quantity)
    
    return {
        "po_number": new_po["po_number"],
        "status": "Created & Fulfilled (Demo)",
        "delivery_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "details": new_po
    }

@router.get("/sap/finance")
def get_sap_finance():
    """
    Mock SAP S/4HANA Cash Flow Analysis (API_JOURNALENTRY_SRV)
    """
    # Just return the current state, maybe add random fluctuation
    fin = mock_state.data["sap"]["finance"]
    return {
        "cash_on_hand": fin["cash_on_hand"],
        "currency": "USD",
        "daily_burn_rate": fin["daily_burn_rate"],
        "alert_status": "NORMAL"
    }

# --- Salesforce Mocks ---

@router.get("/salesforce/opportunities/{opp_id}")
def get_salesforce_opportunity(opp_id: str):
    """
    Mock Salesforce Opportunity (Sales Cloud)
    """
    opps = mock_state.data["salesforce"]["opportunities"]
    for o in opps:
        # Fuzzy match for demo convenience if ID isn't exact
        if o["id"] == opp_id or opp_id.lower() in o["id"].lower():
             return {**o, "impact_analysis": "High Risk if supply chain delayed > 1 week"}
    
    raise HTTPException(status_code=404, detail="Opportunity not found")

@router.get("/salesforce/accounts")
def list_salesforce_accounts():
    accounts = [
        {"id": "ACC-001", "name": "Tesla Inc.", "tier": "Strategic"},
        {"id": "ACC-002", "name": "SpaceX", "tier": "Enterprise"},
        {"id": "ACC-003", "name": "Rivian", "tier": "Growth"},
        {"id": "ACC-004", "name": "Ford Motor Co.", "tier": "Strategic"},
        {"id": "ACC-005", "name": "General Motors", "tier": "Enterprise"},
        {"id": "ACC-006", "name": "Lucid Motors", "tier": "Growth"},
        {"id": "ACC-007", "name": "Boeing", "tier": "Strategic"},
        {"id": "ACC-008", "name": "Lockheed Martin", "tier": "Enterprise"},
        {"id": "ACC-009", "name": "Northrop Grumman", "tier": "Enterprise"},
        {"id": "ACC-010", "name": "Raytheon", "tier": "Enterprise"},
        {"id": "ACC-011", "name": "Anduril", "tier": "Growth"},
        {"id": "ACC-012", "name": "Palantir", "tier": "Strategic"},
        {"id": "ACC-013", "name": "Google", "tier": "Strategic"},
        {"id": "ACC-014", "name": "Amazon", "tier": "Strategic"},
        {"id": "ACC-015", "name": "Microsoft", "tier": "Strategic"},
    ]
    return accounts

@router.post("/salesforce/cases")
def create_salesforce_case(subject: str, description: str, priority: str = "Medium"):
    new_case = {
        "case_number": f"CAS-{random.randint(1000, 9999)}",
        "subject": subject,
        "description": description,
        "status": "New",
        "priority": priority
    }
    mock_state.data["salesforce"]["cases"].append(new_case)
    mock_state._save_data()
    return new_case

# --- Workday Mocks ---

@router.get("/workday/workers/{worker_id}")
def get_workday_worker(worker_id: str):
    """
    Mock Workday Worker Profile (HCM)
    """
    w = mock_state.get_worker(worker_id)
    if not w:
         # Fallback to generating one if not in seed
         return {
            "id": worker_id,
            "name": "Generic Employee",
            "title": "Staff",
            "department": "General",
            "location": "Remote",
            "email": f"{worker_id}@example.com",
            "reports_to": "Manager"
        }
    return w

@router.get("/workday/time-off/{worker_id}")
def get_workday_time_off(worker_id: str):
    """
    Mock Workday Absence Management (Burnout Risk)
    """
    # Try to find in mock data
    to = mock_state.data["workday"]["time_off"].get(worker_id)
    if to:
        return {
            "worker_id": worker_id,
            "vacation_balance_hours": to["vacation_balance"],
            "sick_leave_hours": to["sick_leave"],
            "last_vacation_date": "2024-06-15",
            "burnout_risk": to["burnout_risk"]
        }
    
    return {
        "worker_id": worker_id,
        "vacation_balance_hours": 120,
        "sick_leave_hours": 40,
        "last_vacation_date": "2024-06-15",
        "burnout_risk": "Medium" 
    }

@router.get("/workday/org-chart/{org_id}")
def get_workday_org_chart(org_id: str):
    return {
         "id": org_id,
         "name": "Global Supply Chain",
         "leader": "Sarah Connor",
         "headcount": 145,
         "open_roles": 12
    }

@router.get("/workday/team")
def get_workday_team():
    """
    Mock Workday Team Directory
    """
    # Return seeded workers + generated ones
    return mock_state.data["workday"]["workers"]

# --- ServiceNow Mocks ---

class Incident(BaseModel):
    short_description: str
    urgency: int # 1=High, 3=Low

@router.post("/servicenow/incident")
def create_incident(incident: Incident):
    """
    Mock ServiceNow Incident Management
    """
    return mock_state.create_incident(incident.short_description, incident.urgency)

@router.post("/servicenow/change-request")
def create_change_request(description: str, risk: str = "Moderate"):
    return {
         "number": f"CHG{random.randint(50000, 99999)}",
         "state": "Assess",
         "risk": risk,
         "description": description
    }

@router.get("/servicenow/cmdb/servers")
def get_cmdb_servers():
    """
    Mock CMDB Query
    """
    servers = []
    os_types = ["Linux RedHat", "Windows Server 2022", "Ubuntu 22.04", "Cisco IOS", "VMware ESXi"]
    statuses = ["Online", "Offline", "Maintenance", "Degraded"]
    
    # Critical Infrastructure
    servers.append({"name": "Station-Alpha-Primary", "ip": "10.0.1.5", "status": "Online", "os": "Linux RedHat"})
    servers.append({"name": "Station-Alpha-Backup", "ip": "10.0.1.6", "status": "Maintenance", "os": "Linux RedHat"})
    servers.append({"name": "Gateway-North", "ip": "192.168.1.1", "status": "Degraded", "os": "Cisco IOS"})

    # Generated Fleet
    for i in range(1, 20):
        servers.append({
            "name": f"App-Server-Cluster-{i:02d}",
            "ip": f"10.20.5.{i+10}",
            "status": random.choice(statuses),
            "os": random.choice(os_types)
        })
    
    return servers

# --- Communications Mocks ---

class ChatMessage(BaseModel):
    channel: str
    text: str
    platform: str = "Slack"

@router.post("/communications/send")
def send_message(msg: ChatMessage):
    """
    Mock Slack/Teams Message Send
    """
    return {
        "status": "Sent",
        "platform": msg.platform,
        "channel": msg.channel,
        "timestamp": datetime.now().timestamp(),
        "message_id": f"msg_{random.randint(10000,99999)}"
    }
