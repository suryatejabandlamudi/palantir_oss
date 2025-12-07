from typing import List, Dict, Any

OPPORTUNITIES = [
    {"id": "OPP-001", "name": "Big Deal", "account_id": "ACC-100", "amount": 50000, "stage": "Negotiation", "close_date": "2023-12-31"},
    {"id": "OPP-002", "name": "Small Deal", "account_id": "ACC-101", "amount": 5000, "stage": "Prospecting", "close_date": "2024-01-15"},
    {"id": "OPP-003", "name": "Renewal", "account_id": "ACC-100", "amount": 15000, "stage": "Closed Won", "close_date": "2023-10-01"},
]

QUOTES = [
    {"id": "Q-500", "opportunity_id": "OPP-001", "amount": 48000, "status": "Draft"},
    {"id": "Q-501", "opportunity_id": "OPP-001", "amount": 50000, "status": "Approved"},
]

def search_mock_opportunities(query: str = None) -> List[Dict[str, Any]]:
    if not query:
        return OPPORTUNITIES
    query = query.lower()
    return [opp for opp in OPPORTUNITIES if query in opp["name"].lower() or query in opp["account_id"].lower()]

def get_mock_quote(quote_id: str) -> Dict[str, Any]:
    for q in QUOTES:
        if q["id"] == quote_id:
            return q
    return None

def create_mock_opportunity(name: str, account_id: str, amount: float) -> Dict[str, Any]:
    return {
        "id": "OPP-NEW-999",
        "name": name,
        "account_id": account_id,
        "amount": amount,
        "stage": "Prospecting",
        "message": "Opportunity created successfully."
    }
