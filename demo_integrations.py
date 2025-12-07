import sys
import os
import json
import datetime
from unittest.mock import MagicMock, patch

# Add project root to path
sys.path.append(os.getcwd())

from nexus_os.core.integrations.erp.client import ERPConnector
from nexus_os.core.integrations.crm.client import CRMConnector
from nexus_os.core.integrations.hris.client import HRISConnector
from nexus_os.core.integrations.itsm.client import ITSMConnector
from nexus_os.core.integrations.comms.teams import TeamsConnector
from nexus_os.core.integrations.comms.slack import SlackConnector
from nexus_os.core.integrations.data.snowflake import SnowflakeConnector

# --- Mock Data ---
MOCK_DATA = {
    "erp_get_inventory": {
        "value": [
            {"id": "item-1", "number": "1000", "displayName": "Industrial Pump", "inventory": 45, "unitPrice": 1200.00},
            {"id": "item-2", "number": "1001", "displayName": "Valve Set", "inventory": 12, "unitPrice": 350.50}
        ]
    },
    "crm_get_leads": {
        "records": [
            {"Id": "lead-1", "Name": "Acme Corp", "Email": "contact@acme.com", "Company": "Acme Corp", "Status": "New"},
            {"Id": "lead-2", "Name": "Stark Ind", "Email": "tony@stark.com", "Company": "Stark Industries", "Status": "Working"}
        ]
    },
    "hris_get_employee": {
        "data": [
            {"id": "emp-1", "name": "John Doe", "title": "Systems Engineer", "department": "Engineering", "email": "john.doe@example.com"}
        ]
    },
    "itsm_create_incident": {
        "result": {"number": "INC0012345", "sys_id": "sys-123", "state": "New"}
    },
    "snowflake_query": {
        "data": [
            ["2023-10-01", 15000.00],
            ["2023-10-02", 18200.50],
            ["2023-10-03", 14500.00]
        ],
        "resultSetMetaData": {"rowType": [{"name": "DATE"}, {"name": "REVENUE"}]}
    },
    "teams_send_message": {
        "id": "msg-1", "createdDateTime": "2023-10-27T10:00:00Z"
    },
    "slack_send_message": {
        "ok": True, "ts": "1234567890.123456", "channel": "C12345"
    }
}

# --- HTML Report Generator ---
class HTMLReport:
    def __init__(self):
        self.events = []

    def add_event(self, source, action, result, status="SUCCESS"):
        self.events.append({
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
            "source": source,
            "action": action,
            "result": json.dumps(result, indent=2),
            "status": status
        })

    def generate(self, filename="demo_report.html"):
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1e1e1e; color: #d4d4d4; margin: 0; padding: 20px; }
                h1 { color: #4ec9b0; border-bottom: 1px solid #333; padding-bottom: 10px; }
                .event { background-color: #252526; margin-bottom: 15px; border-left: 4px solid #4ec9b0; padding: 15px; border-radius: 3px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .source { font-weight: bold; color: #569cd6; }
                .action { color: #dcdcaa; }
                .timestamp { color: #808080; font-size: 0.9em; }
                pre { background-color: #1e1e1e; padding: 10px; border-radius: 3px; overflow-x: auto; color: #9cdcfe; margin: 0; }
                .status-SUCCESS { color: #6a9955; font-weight: bold; }
                .status-ERROR { color: #f44747; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Palantir OSS - Integration Verification Log</h1>
        """
        for event in self.events:
            html += f"""
            <div class="event">
                <div class="header">
                    <div>
                        <span class="source">[{event['source']}]</span>
                        <span class="action">{event['action']}</span>
                    </div>
                    <span class="timestamp">{event['timestamp']}</span>
                </div>
                <div>Status: <span class="status-{event['status']}">{event['status']}</span></div>
                <pre>{event['result']}</pre>
            </div>
            """
        html += "</body></html>"
        
        with open(filename, "w") as f:
            f.write(html)
        print(f"Report generated: {filename}")

# --- Simulation ---
def run_simulation():
    report = HTMLReport()
    
    # Patching API Client to return mock data
    # We don't strictly need the global patch if we are manually assigning mocks, but keeping it for safety.
    with patch('core.client.APIClient.get') as mock_get, \
         patch('core.client.APIClient.post') as mock_post:

        # 1. ERP: Check Inventory
        print("Testing ERP...")
        erp = ERPConnector()
        if not erp.client: 
            erp.client = MagicMock()
        # Configure the instance mock
        erp.client.get.return_value = MOCK_DATA["erp_get_inventory"]
        
        res = erp.execute_tool("erp_get_inventory", item_id="pump")
        report.add_event("Dynamics 365 (ERP)", "Check Inventory", res)

        # 2. CRM: Get Leads
        print("Testing CRM...")
        crm = CRMConnector()
        if not crm.client: 
            crm.client = MagicMock()
        crm.client.get.return_value = MOCK_DATA["crm_get_leads"]
        
        res = crm.execute_tool("crm_get_leads", email="contact@acme.com")
        report.add_event("Salesforce (CRM)", "Retrieve Leads", res)

        # 3. HRIS: Get Employee
        print("Testing HRIS...")
        hris = HRISConnector()
        if not hris.client: 
            hris.client = MagicMock()
        hris.client.get.return_value = MOCK_DATA["hris_get_employee"]
        
        res = hris.execute_tool("hris_get_employee", email="john.doe@example.com")
        report.add_event("Workday (HRIS)", "Get Employee Details", res)

        # 4. Data: Snowflake Query
        print("Testing Data Layer...")
        sf = SnowflakeConnector()
        if not sf.client: 
            sf.client = MagicMock()
        sf.client.post.return_value = MOCK_DATA["snowflake_query"]
        
        res = sf.execute_tool("snowflake_query", statement="SELECT date, revenue FROM sales LIMIT 3")
        report.add_event("Snowflake (Data)", "Execute SQL Query", res)

        # 5. ITSM: Create Incident
        print("Testing ITSM...")
        itsm = ITSMConnector()
        if not itsm.client: 
            itsm.client = MagicMock()
        itsm.client.post.return_value = MOCK_DATA["itsm_create_incident"]
        
        res = itsm.execute_tool("itsm_create_incident", short_description="System outage detected")
        report.add_event("ServiceNow (ITSM)", "Create Incident", res)

        # 6. Comms: Send Teams Message
        print("Testing Comms...")
        teams = TeamsConnector()
        if not teams.client: 
            teams.client = MagicMock()
        teams.client.post.return_value = MOCK_DATA["teams_send_message"]
        
        res = teams.execute_tool("teams_send_message", team_id="t1", channel_id="c1", message="Alert: System outage ticket created.")
        report.add_event("Microsoft Teams", "Send Alert", res)

    report.generate("integration_test_report.html")

if __name__ == "__main__":
    run_simulation()
