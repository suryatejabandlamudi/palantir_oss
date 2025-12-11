import requests
import json

BASE_URL = "http://localhost:8000/mock"

def test_endpoint(name, url, method="GET", data=None):
    print(f"Testing {name}...", end=" ")
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=data)
            
        if response.status_code == 200:
            print("OK")
            # print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"FAILED ({response.status_code})")
            print(response.text)
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def run_tests():
    print("=== Nexus OS Mock API Verification ===\n")
    
    # SAP
    test_endpoint("SAP Inventory", f"{BASE_URL}/sap/inventory")
    test_endpoint("SAP Finance", f"{BASE_URL}/sap/finance")
    test_endpoint("SAP PO Creation", f"{BASE_URL}/sap/purchase-order", "POST", {
        "material_id": "MAT-001", "quantity": 100, "supplier_id": "SUP-99"
    })
    
    # Salesforce
    test_endpoint("Salesforce Opportunity", f"{BASE_URL}/salesforce/opportunities/OPP-001")
    test_endpoint("Salesforce Accounts", f"{BASE_URL}/salesforce/accounts")
    test_endpoint("Salesforce Case Create", f"{BASE_URL}/salesforce/cases", "POST", {
        "subject": "Test Case", "description": "Test Desc"
    })
    
    # Workday
    test_endpoint("Workday Worker", f"{BASE_URL}/workday/workers/W-101")
    test_endpoint("Workday Time Off", f"{BASE_URL}/workday/time-off/W-101")
    
    # ServiceNow
    test_endpoint("ServiceNow Incident", f"{BASE_URL}/servicenow/incident", "POST", {
        "short_description": "Server Down", "urgency": 1
    })
    test_endpoint("ServiceNow CMDB", f"{BASE_URL}/servicenow/cmdb/servers")
    
    # Communications
    test_endpoint("Slack Message", f"{BASE_URL}/communications/send", "POST", {
        "channel": "C123", "text": "Hello"
    })

if __name__ == "__main__":
    run_tests()
