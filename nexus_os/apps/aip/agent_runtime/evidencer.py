from typing import List, Dict, Any
from rag.store import VectorStore
from core.config import config
import uuid

class Evidencer:
    """
    The 'Evidencer' component of the Enterprise Process Brain.
    Retrieves signed citations from the Knowledge Base (Vector Store).
    Supports Mock Mode for demos without API keys.
    """
    def __init__(self):
        self.mock_mode = not config.GEMINI_API_KEY
        if not self.mock_mode:
            self.store = VectorStore()
        else:
            self.store = None
            print("WARNING: Gemini API Key not found. Evidencer running in MOCK MODE.")

    def search(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        if self.mock_mode:
            return self._mock_search(query)
        
        try:
            return self.store.query(query, n_results)
        except Exception as e:
            print(f"Error querying VectorStore: {e}")
            return self._mock_search(query)

    def _mock_search(self, query: str) -> List[Dict[str, Any]]:
        """
        Returns pre-canned 'evidence' based on keywords for the demo scenarios.
        """
        query_lower = query.lower()
        results = []

        # CTO Scenario: Release Risk
        if "rollback" in query_lower or "deployment policy" in query_lower or "deploy" in query_lower:
            results.append({
                "id": "DOC-POL-001",
                "content": "Deployment Policy v2.1: All production changes must have a tested rollback plan. Changes with risk score > 7 require VP approval.",
                "metadata": {"source": "Confluence", "author": "CTO Office", "date": "2025-01-15"}
            })
            results.append({
                "id": "INC-2024-005",
                "content": "Post-Mortem: Database migration failed due to missing rollback script. Downtime: 4 hours.",
                "metadata": {"source": "Jira", "type": "Incident", "date": "2024-11-20"}
            })

        # HR Scenario: Burnout
        if "burnout" in query_lower or "hr policy" in query_lower or "leave" in query_lower:
             results.append({
                "id": "DOC-HR-003",
                "content": "Employee Well-being Policy: Managers must intervene if an employee has not taken leave for 4 consecutive months.",
                "metadata": {"source": "SharePoint", "author": "HR Dept", "date": "2024-08-10"}
            })

        # Supply Chain Scenario
        if "delay" in query_lower or "supplier" in query_lower:
            results.append({
                "id": "CON-SUP-009",
                "content": "Supplier Agreement with TechParts Inc: 5% penalty for delays > 7 days. Expedited shipping at supplier expense.",
                "metadata": {"source": "DocuSign", "type": "Contract", "date": "2023-05-01"}
            })

        return results

    def add_evidence(self, content: str, metadata: Dict[str, Any]):
        """
        Ingests new evidence (only works in Real mode).
        """
        if self.mock_mode:
            print(f"Mock Mode: Pretending to ingest '{content[:20]}...'")
            return
        
        self.store.add_documents([content], [metadata])
