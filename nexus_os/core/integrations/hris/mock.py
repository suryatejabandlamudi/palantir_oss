from typing import List, Dict, Any

EMPLOYEES = [
    {"id": "EMP-001", "name": "John Doe", "title": "Software Engineer", "department": "Engineering", "manager_id": "EMP-002", "email": "john.doe@example.com"},
    {"id": "EMP-002", "name": "Jane Smith", "title": "Engineering Manager", "department": "Engineering", "manager_id": "EMP-003", "email": "jane.smith@example.com"},
    {"id": "EMP-003", "name": "Alice Johnson", "title": "VP of Engineering", "department": "Engineering", "manager_id": None, "email": "alice.johnson@example.com"},
    {"id": "EMP-004", "name": "Bob Brown", "title": "Sales Representative", "department": "Sales", "manager_id": "EMP-005", "email": "bob.brown@example.com"},
]

ORG_CHART = {
    "EMP-003": ["EMP-002"],
    "EMP-002": ["EMP-001"],
    "EMP-005": ["EMP-004"]
}

def get_mock_employee_profile(employee_id: str = None, name: str = None) -> Dict[str, Any]:
    for emp in EMPLOYEES:
        if employee_id and emp["id"] == employee_id:
            return emp
        if name and emp["name"].lower() == name.lower():
            return emp
    return None

def get_mock_org_chart(manager_id: str) -> List[Dict[str, Any]]:
    direct_reports_ids = ORG_CHART.get(manager_id, [])
    return [emp for emp in EMPLOYEES if emp["id"] in direct_reports_ids]
