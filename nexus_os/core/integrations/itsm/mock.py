from typing import List, Dict, Any

INCIDENTS = [
    {"number": "INC001001", "short_description": "Email server is down", "state": "New", "priority": "1 - Critical", "assigned_to": "EMP-002"},
    {"number": "INC001002", "short_description": "Printer on 2nd floor jammed", "state": "In Progress", "priority": "3 - Moderate", "assigned_to": "EMP-001"},
    {"number": "INC001003", "short_description": "VPN access issue for remote users", "state": "Resolved", "priority": "2 - High", "assigned_to": "EMP-002"},
]

def search_mock_incidents(query: str = None, state: str = None) -> List[Dict[str, Any]]:
    results = INCIDENTS
    if query:
        results = [inc for inc in results if query.lower() in inc["short_description"].lower()]
    if state:
        results = [inc for inc in results if inc["state"].lower() == state.lower()]
    return results

def create_mock_incident(short_description: str, priority: str) -> Dict[str, Any]:
    new_number = f"INC00100{len(INCIDENTS) + 1}"
    new_incident = {
        "number": new_number,
        "short_description": short_description,
        "state": "New",
        "priority": priority,
        "assigned_to": None,
        "message": "Incident created successfully."
    }
    # In a real mock, we'd append to INCIDENTS, but for statelessness we just return it
    return new_incident
