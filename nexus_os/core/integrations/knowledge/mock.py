from typing import List, Dict, Any

DOCS = [
    {"id": "DOC-100", "title": "Company Vacation Policy", "content": "Employees are entitled to 20 days of paid vacation per year...", "url": "https://confluence.example.com/vacation-policy"},
    {"id": "DOC-101", "title": "Engineering Onboarding Guide", "content": "Welcome to the team! Here is how to set up your dev environment...", "url": "https://confluence.example.com/onboarding"},
    {"id": "DOC-102", "title": "Q3 Sales Strategy", "content": "Our focus for Q3 is on expanding into the APAC region...", "url": "https://confluence.example.com/q3-strategy"},
]

ISSUES = [
    {"key": "PROJ-123", "summary": "Implement login page", "status": "In Progress", "assignee": "John Doe"},
    {"key": "PROJ-124", "summary": "Fix CSS bug on homepage", "status": "To Do", "assignee": "Jane Smith"},
]

def search_mock_docs(query: str) -> List[Dict[str, Any]]:
    query = query.lower()
    return [doc for doc in DOCS if query in doc["title"].lower() or query in doc["content"].lower()]

def create_mock_issue(project: str, summary: str, description: str) -> Dict[str, Any]:
    new_key = f"{project}-{len(ISSUES) + 125}"
    return {
        "key": new_key,
        "project": project,
        "summary": summary,
        "description": description,
        "status": "To Do",
        "message": "Jira issue created successfully."
    }
