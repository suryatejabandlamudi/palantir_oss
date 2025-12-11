import json
import os
import random
from datetime import datetime, timedelta

MOCK_DB_FILE = "mock_data.json"

class MockStateManager:
    """
    Manages stateful mock data for Enterprise Integrations.
    Persists data to a local JSON file to simulate a real database.
    """
    def __init__(self):
        self.data = self._load_data()
        
    def _load_data(self):
        if os.path.exists(MOCK_DB_FILE):
            try:
                with open(MOCK_DB_FILE, "r") as f:
                    return json.load(f)
            except:
                return self._seed_data()
        else:
            return self._seed_data()
            
    def _save_data(self):
        with open(MOCK_DB_FILE, "w") as f:
            json.dump(self.data, f, indent=2)

    def _seed_data(self):
        """Generates initial seed data for the 'fresh' state."""
        return {
            "sap": {
                "inventory": [
                    {"material_id": "MAT-001", "name": "Lithium Ion Cells", "plant": "Plant_A", "stock": 15000, "unit": "EA"},
                    {"material_id": "MAT-002", "name": "Control Chipset XN", "plant": "Plant_A", "stock": 420, "unit": "EA"}, # Low stock!
                    {"material_id": "MAT-003", "name": "Steel Casing", "plant": "Plant_B", "stock": 8000, "unit": "EA"},
                    {"material_id": "MAT-004", "name": "Coolant Pump v2", "plant": "Hamburg_DC", "stock": 2500, "unit": "EA"},
                ],
                "finance": {
                    "cash_on_hand": 25000000.00,
                    "daily_burn_rate": 50000.00
                },
                "purchase_orders": []
            },
            "salesforce": {
                "opportunities": [
                    {
                        "id": "OPP-001",
                        "name": "Tesla Gigafactory Expansion",
                        "account": "Tesla Inc.",
                        "amount": 15000000.00,
                        "stage": "Negotiation/Review",
                        "probability": 85,
                        "close_date": "2025-12-31"
                    }
                ],
                "cases": []
            },
            "workday": {
                "workers": [
                    {"id": "W-001", "name": "Sarah Connor", "title": "VP of Supply Chain", "department": "Operations", "reports_to": "CEO"},
                    {"id": "W-002", "name": "John Smith", "title": "Logistics Manager", "department": "Logistics", "reports_to": "W-001"}
                ],
                "time_off": {
                    "W-001": {"vacation_balance": 120, "sick_leave": 40, "burnout_risk": "Medium"}
                }
            },
            "servicenow": {
                "incidents": []
            }
        }

    # --- SAP Helpers ---
    def get_inventory(self, material_id=None):
        if material_id:
            return [i for i in self.data["sap"]["inventory"] if i["material_id"] == material_id]
        return self.data["sap"]["inventory"]

    def update_inventory(self, material_id, quantity_change):
        """Updates inventory. Negative quantity_change reduces stock."""
        for item in self.data["sap"]["inventory"]:
            if item["material_id"] == material_id:
                item["stock"] += quantity_change
                self._save_data()
                return item
        return None

    def create_po(self, material_id, quantity, supplier_id):
        po = {
            "po_number": f"PO-{random.randint(100000, 999999)}",
            "material_id": material_id,
            "quantity": quantity,
            "supplier_id": supplier_id,
            "status": "Created",
            "created_at": datetime.now().isoformat()
        }
        self.data["sap"]["purchase_orders"].append(po)
        
        # Simulate immediate stock increase for demo speed? 
        # Or require a "receive" step? Let's just increase mock stock to show "result" 
        # if the user asks "did it arrive?". 
        # For realism, let's keep it separate, but maybe have an 'auto-receive' hook.
        # For now, just create PO.
        
        self._save_data()
        return po

    # --- Workday Helpers ---
    def get_worker(self, worker_id):
        for w in self.data["workday"]["workers"]:
            if w["id"] == worker_id:
                return w
        return None

    # --- ServiceNow Helpers ---
    def create_incident(self, description, urgency):
        inc = {
             "number": f"INC{random.randint(1000000, 9999999)}",
             "short_description": description,
             "urgency": urgency,
             "state": "New",
             "created_on": datetime.now().isoformat()
        }
        self.data["servicenow"]["incidents"].append(inc)
        self._save_data()
        return inc

mock_state = MockStateManager()
