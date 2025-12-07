
import requests
import json
import uuid
import random
from datetime import datetime, timedelta

API_URL = "http://localhost:8000"

def create_type(api_name, display_name, icon, color, props):
    payload = {
        "api_name": api_name,
        "display_name": display_name,
        "description": f"Crisis Entity: {display_name}",
        "icon": icon,
        "color": color,
        "property_definitions": props,
        "action_definitions": []
    }
    try:
        r = requests.post(f"{API_URL}/ontology/types", json=payload)
        if r.status_code == 200:
            return r.json()["id"]
        # Fallback: fetch existing
        types = requests.get(f"{API_URL}/ontology/types").json()
        for t in types:
            if t["api_name"] == api_name: return t["id"]
    except Exception as e:
        print(f"Error creating type {api_name}: {e}")
    return None

def create_obj(type_id, title, props):
    try:
        requests.post(f"{API_URL}/objects", json={
            "object_type_id": type_id,
            "title": title,
            "properties": props
        })
        print(f"Created: {title}")
    except Exception as e:
        print(f"Error creating object {title}: {e}")

def generate_crisis():
    print("🚨 INITIATING CRISIS SCENARIO GENERATION 🚨")

    # 1. Define Types
    station_id = create_type("power_station", "Power Station", "zap", "#EF4444", [
        {"name": "status", "type": "string", "title": "Operational Status"},
        {"name": "output_mw", "type": "integer", "title": "Output (MW)"},
        {"name": "incident", "type": "string", "title": "Active Incident"},
        {"name": "location", "type": "string", "title": "Location"},
        {"name": "latitude", "type": "float", "title": "Latitude"},
        {"name": "longitude", "type": "float", "title": "Longitude"}
    ])

    crew_id = create_type("repair_crew", "Repair Crew", "truck", "#3B82F6", [
        {"name": "status", "type": "string", "title": "Dispatch Status"},
        {"name": "specialty", "type": "string", "title": "Specialty"},
        {"name": "target", "type": "string", "title": "Target Asset"},
        {"name": "latitude", "type": "float", "title": "Latitude"},
        {"name": "longitude", "type": "float", "title": "Longitude"}
    ])

    incident_id = create_type("cyber_incident", "Cyber Incident", "shield-alert", "#DC2626", [
        {"name": "severity", "type": "string", "title": "Severity"},
        {"name": "threat_actor", "type": "string", "title": "Threat Actor"},
        {"name": "status", "type": "string", "title": "Status"},
        {"name": "description", "type": "string", "title": "Description"}
    ])

    # 2. Populate Crisis Data
    # Power Stations
    create_obj(station_id, "Station Alpha", {
        "status": "CRITICAL FAILURE",
        "output_mw": 0,
        "incident": "MALWARE DETECTED: TRITON",
        "location": "North Sector",
        "latitude": 40.7128,
        "longitude": -74.0060
    })
    create_obj(station_id, "Station Beta", {
        "status": "OPERATIONAL",
        "output_mw": 450,
        "incident": "None",
        "location": "East Sector",
        "latitude": 40.7580,
        "longitude": -73.9855
    })

    # Repair Crews
    create_obj(crew_id, "Cyber Response Unit 1", {
        "status": "EN ROUTE",
        "specialty": "ICS Forensics",
        "target": "Station Alpha",
        "latitude": 40.7300,
        "longitude": -73.9900
    })

    # Incidents
    create_obj(incident_id, "INC-2025-99", {
        "severity": "CRITICAL",
        "threat_actor": "UNKNOWN (TRITON Signature)",
        "status": "ACTIVE",
        "description": "Unidentified traffic on Port 502 controlling Turbine logic."
    })

    # --- NEW SCENARIOS ---

    # 3. Supply Chain Scenario (Tesla/Apple)
    order_id = create_type("sales_order", "Sales Order", "shopping-cart", "#F59E0B", [
        {"name": "customer", "type": "string", "title": "Customer"},
        {"name": "amount", "type": "integer", "title": "Amount ($)"},
        {"name": "status", "type": "string", "title": "Status"},
        {"name": "delivery_date", "type": "string", "title": "Delivery Date"},
        {"name": "priority", "type": "string", "title": "Priority"},
        {"name": "latitude", "type": "float", "title": "Latitude"},
        {"name": "longitude", "type": "float", "title": "Longitude"}
    ])
    
    create_obj(order_id, "SO-1001", {
        "customer": "Apple Inc.", "amount": 500000, "status": "Delayed", "delivery_date": "2025-09-10", "priority": "Standard",
        "latitude": 37.3349, "longitude": -122.0090 # Cupertino
    })
    create_obj(order_id, "SO-1002", {
        "customer": "Tesla Inc.", "amount": 1200000, "status": "Delayed", "delivery_date": "2025-09-10", "priority": "Strategic",
        "latitude": 30.2672, "longitude": -97.7431 # Austin
    })

    # 4. HR Scenario (Burnout Risk)
    employee_id = create_type("employee", "Employee", "user", "#8B5CF6", [
        {"name": "role", "type": "string", "title": "Role"},
        {"name": "department", "type": "string", "title": "Department"},
        {"name": "leave_balance", "type": "integer", "title": "Leave Balance (Hrs)"},
        {"name": "last_leave_date", "type": "string", "title": "Last Leave Taken"},
        {"name": "avg_weekly_meetings", "type": "integer", "title": "Avg Weekly Meetings"}
    ])

    create_obj(employee_id, "Sarah Connor", {
        "role": "Senior Engineer", "department": "Engineering", "leave_balance": 120, "last_leave_date": "2025-05-01", "avg_weekly_meetings": 35
    })

    # 5. Finance Scenario (Cash Trough)
    invoice_id = create_type("invoice", "Invoice", "dollar-sign", "#10B981", [
        {"name": "vendor", "type": "string", "title": "Vendor"},
        {"name": "amount", "type": "integer", "title": "Amount ($)"},
        {"name": "due_date", "type": "string", "title": "Due Date"},
        {"name": "status", "type": "string", "title": "Status"}
    ])

    create_obj(invoice_id, "INV-2025-001", {
        "vendor": "V-INTEL Corp", "amount": 500000, "due_date": "2025-10-15", "status": "Pending"
    })

    print("✅ SYSTEM GENERATION COMPLETE: Energy, Supply Chain, HR, Finance Scenarios Live.")

if __name__ == "__main__":
    generate_crisis()
