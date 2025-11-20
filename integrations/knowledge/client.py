from typing import List, Dict, Any
from integrations.base import BaseConnector
from core.client import APIClient
from core.auth import BasicAuthProvider
from core.config import config

class KnowledgeConnector(BaseConnector):
    """
    Real Connector for Atlassian (Jira & Confluence).
    Uses Basic Auth (Email + API Token).
    """

    def __init__(self):
        super().__init__()
        if config.ATLASSIAN_DOMAIN and config.ATLASSIAN_EMAIL and config.ATLASSIAN_API_TOKEN:
            self.auth = BasicAuthProvider(
                username=config.ATLASSIAN_EMAIL,
                token=config.ATLASSIAN_API_TOKEN
            )
            
            # Base URL for Jira Cloud
            # https://your-domain.atlassian.net/rest/api/3
            self.jira_client = APIClient(
                base_url=f"https://{config.ATLASSIAN_DOMAIN}.atlassian.net/rest/api/3",
                auth_provider=self.auth
            )
            
            # Base URL for Confluence Cloud
            # https://your-domain.atlassian.net/wiki/rest/api
            self.confluence_client = APIClient(
                base_url=f"https://{config.ATLASSIAN_DOMAIN}.atlassian.net/wiki/rest/api",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Atlassian credentials not found. KnowledgeConnector will fail if used.")
            self.jira_client = None
            self.confluence_client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "knowledge_search_jira",
                "description": "Searches for Jira issues using JQL.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "jql": {
                            "type": "string",
                            "description": "Jira Query Language string (e.g., 'project = PROJ AND status = Open')."
                        }
                    },
                    "required": ["jql"]
                }
            },
            {
                "name": "knowledge_search_confluence",
                "description": "Searches for Confluence pages.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Text to search for in Confluence."
                        }
                    },
                    "required": ["query"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.jira_client or not self.confluence_client:
            return "Error: Atlassian credentials not configured."

        if tool_name == "knowledge_search_jira":
            return self._search_jira(kwargs.get("jql"))
        elif tool_name == "knowledge_search_confluence":
            return self._search_confluence(kwargs.get("query"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _search_jira(self, jql: str) -> List[Dict[str, Any]]:
        params = {
            "jql": jql,
            "maxResults": 10,
            "fields": "id,key,summary,status,assignee,priority"
        }
        
        data = self.jira_client.get("search", params=params)
        if not data:
            return []
            
        issues = []
        for item in data.get("issues", []):
            fields = item.get("fields", {})
            issues.append({
                "id": item.get("id"),
                "key": item.get("key"),
                "summary": fields.get("summary"),
                "status": fields.get("status", {}).get("name"),
                "assignee": fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
                "priority": fields.get("priority", {}).get("name")
            })
        return issues

    def _search_confluence(self, query: str) -> List[Dict[str, Any]]:
        # Confluence CQL search
        # /content/search?cql=text~"query"
        params = {
            "cql": f'text ~ "{query}"',
            "limit": 5
        }
        
        data = self.confluence_client.get("content/search", params=params)
        if not data:
            return []
            
        pages = []
        for item in data.get("results", []):
            pages.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "url": f"https://{config.ATLASSIAN_DOMAIN}.atlassian.net/wiki{item.get('_links', {}).get('webui')}",
                "type": item.get("type")
            })
        return pages
