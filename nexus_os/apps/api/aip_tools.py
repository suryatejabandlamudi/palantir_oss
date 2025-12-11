import json
import requests
from nexus_os.core.duckdb_client import duck_db
from nexus_os.apps.api.pipeline_engine import pipeline_engine

import os

# --- CONFIGURATION ---
# If False, uses local mock server. If True, attempts real API calls.
READ_DATA = os.getenv("READ_DATA", "False").lower() == "true"
MOCK_API_BASE = "http://localhost:8000/mock"

def get_api_base(service_name: str):
    """
    Determines the API base URL based on READ_DATA flag.
    In a real implementation, this would return the actual API endpoint for the service.
    """
    if READ_DATA:
        # Placeholder for Real API Endpoints
        # In the future, load these from secure env vars
        if service_name == "sap": return "https://api.sap.com/v1"
        if service_name == "salesforce": return "https://login.salesforce.com/services/data/v60.0"
        if service_name == "workday": return "https://wd5.myworkday.com/ccx/api"
        if service_name == "servicenow": return "https://instance.service-now.com/api"
        return MOCK_API_BASE
    
    return MOCK_API_BASE

def query_ontology(query: str = None):
    """
    Get information about available Object Types (tables) and their schemas.
    If query is provided, searches for specific types.
    """
    try:
        # Get all tables
        tables_df = duck_db.conn.execute("SHOW TABLES").df()
        tables = tables_df['name'].tolist()
        
        schemas = {}
        for t in tables:
            # Get schema for each table
            schema_df = duck_db.conn.execute(f"DESCRIBE \"{t}\"").df()
            columns = schema_df[['column_name', 'column_type']].to_dict(orient="records")
            schemas[t] = columns
            
        return json.dumps(schemas, indent=2)
    except Exception as e:
        return f"Error querying ontology: {e}"

def run_sql_query(sql: str):
    """Execute a SQL query against the DuckDB analytical engine."""
    try:
        return duck_db.raw_query(sql)
    except Exception as e:
        return f"SQL Error: {e}"

# --- Enterprise Integration Tools ---

AVAILABLE_TOOLS = {}

def tool_wrapper(func):
    AVAILABLE_TOOLS[func.__name__] = func
    return func

# --- Enterprise Integration Tools ---

@tool_wrapper
def check_inventory(material_id: str = None):
    """
    Check stock levels in SAP S/4HANA for a specific material or all materials.
    
    Args:
        material_id (str, optional): The ID of the material to check (e.g., 'MAT-001'). 
                                     If None, returns all inventory items.
    
    Returns:
        list or dict: Inventory data including stock count, plant, and critical status.
    """
    try:
        base_url = get_api_base("sap")
        
        url = f"{base_url}/sap/inventory"
        params = {"material_id": material_id} if material_id else {}
        resp = requests.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Failed to check inventory: {str(e)}"}

@tool_wrapper
def create_purchase_order(material_id: str, quantity: int, supplier_id: str):
    """
    Create a new Purchase Order in SAP S/4HANA to replenish stock.
    
    Args:
        material_id (str): The material ID to order (e.g., 'MAT-001').
        quantity (int): The amount to order.
        supplier_id (str): The ID of the supplier (e.g., 'SUP-001').
        
    Returns:
        dict: The created Purchase Order details including PO number and delivery date.
    """
    try:
        base_url = get_api_base("sap")
        url = f"{base_url}/sap/purchase-order"
        data = {"material_id": material_id, "quantity": quantity, "supplier_id": supplier_id}
        resp = requests.post(url, json=data)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Failed to create PO: {str(e)}"}

@tool_wrapper
def check_opportunity(opportunity_id: str):
    """
    Check Salesforce Opportunity status, value, and strategic impact.
    
    Args:
        opportunity_id (str): The ID or name of the opportunity (e.g., 'OPP-001' or 'Tesla').
        
    Returns:
        dict: Opportunity details including stage, probability, and risk analysis.
    """
    try:
        base_url = get_api_base("salesforce")
        url = f"{base_url}/salesforce/opportunities/{opportunity_id}"
        resp = requests.get(url)
        if resp.status_code == 404:
            return {"error": "Opportunity not found."}
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Failed to check opportunity: {str(e)}"}

@tool_wrapper
def check_worker_status(worker_id: str):
    """
    Check Workday profile for an employee, including role, time-off balance, and burnout risk.
    
    Args:
        worker_id (str): The Employee ID (e.g., 'W-001').
        
    Returns:
        dict: Worker profile and absence status.
    """
    try:
         base_url = get_api_base("workday")
         
         # Parallel requests mock
         profile_resp = requests.get(f"{base_url}/workday/workers/{worker_id}")
         time_off_resp = requests.get(f"{base_url}/workday/time-off/{worker_id}")
         
         if profile_resp.status_code != 200:
             return {"error": f"Worker {worker_id} not found."}
             
         profile = profile_resp.json()
         time_off = time_off_resp.json() if time_off_resp.status_code == 200 else {}
         
         return {"profile": profile, "status": time_off}
    except Exception as e:
        return {"error": f"Failed to check worker status: {str(e)}"}

@tool_wrapper
def create_incident_ticket(description: str, urgency: int = 2):
    """
    Create a ServiceNow Incident Ticket for IT or Operational issues.
    
    Args:
        description (str): Short description of the issue.
        urgency (int): Urgency level (1=High, 2=Medium, 3=Low). Default is 2.
        
    Returns:
        dict: Created incident details including Ticket Number.
    """
    try:
        base_url = get_api_base("servicenow")
        url = f"{base_url}/servicenow/incident"
        data = {"short_description": description, "urgency": urgency}
        resp = requests.post(url, json=data)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Failed to create incident: {str(e)}"}

@tool_wrapper
def check_production_status(plant_id: str = "Plant_A"):
    """
    Check real-time production analytics (Prodicys/Prosys) for a specific plant.
    
    Args:
        plant_id (str): The Plant ID to check. Default 'Plant_A'.
        
    Returns:
        dict: Production metrics including efficiency (OEE), active lines, and alerts.
    """
    # Mocking a "Productivity System" response
    import random
    efficiency = random.randint(70, 98)
    status = "Normal" if efficiency > 85 else "Degraded"
    
    return {
        "plant_id": plant_id,
        "system": "Prodicys (Production Analytics)",
        "oee_efficiency": f"{efficiency}%",
        "status": status,
        "active_lines": 12,
        "stopped_lines": 1 if status == "Degraded" else 0,
        "alerts": ["Line 4 Overheating"] if status == "Degraded" else []
    }

@tool_wrapper
def send_message(channel: str, message: str, platform: str = "Slack"):
    """
    Send a message to a communication platform (Slack, Teams).
    
    Args:
        channel (str): The channel name (e.g., '#general') or user ID.
        message (str): The message content to send.
        platform (str): 'Slack' or 'Teams'. Default 'Slack'.
        
    Returns:
        dict: Status of the sent message.
    """
    try:
        base_url = get_api_base("communications")
        url = f"{base_url}/communications/send"
        data = {"channel": channel, "text": message, "platform": platform}
        resp = requests.post(url, json=data)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"Failed to send message: {str(e)}"}

# ------------------------------------

@tool_wrapper
def run_sql_query(sql: str):
    """
    Execute a SQL query against the Nexus OS Data Warehouse (DuckDB).
    Use this for complex analytical queries that specific tools don't cover.
    
    Args:
        sql (str): The SQL query string.
        
    Returns:
        listOrDict: The query results.
    """
    try:
        return duck_db.raw_query(sql)
    except Exception as e:
        return f"SQL Error: {e}"

@tool_wrapper
def create_alert(severity: str, title: str, message: str):
    """
    Create a visible alert/notification for the user in the UI.
    
    Args:
        severity (str): 'info', 'warning', or 'critical'.
        title (str): The title of the alert.
        message (str): The detailed message body.
    """
    return {
        "alert": {
            "severity": severity,
            "title": title,
            "message": message
        }
    }

@tool_wrapper
def analyze_impact(disruption_name: str):
    """
    Analyze the impact of a specific disruption on shipments and value at risk.
    
    Args:
        disruption_name (str): The name of the disruption event (e.g., 'Port Strike').
    """
    try:
        # 1. Find the disruption
        disruption_sql = f"SELECT * FROM Disruption WHERE title = '{disruption_name}'"
        disruptions = duck_db.raw_query(disruption_sql)
        
        if not disruptions:
            return {"error": f"Disruption '{disruption_name}' not found."}
        
        disruption = disruptions[0]
        location = disruption.get('location')
        
        # 2. Find affected shipments
        shipments_sql = f"SELECT * FROM Shipment WHERE origin = '{location}' OR destination = '{location}'"
        affected_shipments = duck_db.raw_query(shipments_sql)
        
        # 3. Calculate Impact
        total_value = sum(s.get('value', 0) for s in affected_shipments)
        critical_count = sum(1 for s in affected_shipments if s.get('priority') == 'Critical')
        
        return {
            "disruption": disruption,
            "impact_summary": {
                "total_value_at_risk": total_value,
                "affected_shipment_count": len(affected_shipments),
                "critical_shipments": critical_count
            },
            "affected_shipments": affected_shipments[:10] 
        }
        
    except Exception as e:
        return {"error": str(e)}

@tool_wrapper
def query_ontology(query: str = None):
    """
    Get information about available Object Types (tables) and their schemas.
    
    Args:
        query (str, optional): Search term for types.
    """
    try:
        tables_df = duck_db.conn.execute("SHOW TABLES").df()
        tables = tables_df['name'].tolist()
        
        schemas = {}
        for t in tables:
            schema_df = duck_db.conn.execute(f"DESCRIBE \"{t}\"").df()
            columns = schema_df[['column_name', 'column_type']].to_dict(orient="records")
            schemas[t] = columns
            
        return json.dumps(schemas, indent=2)
    except Exception as e:
        return f"Error querying ontology: {e}"
