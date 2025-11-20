from typing import List, Dict, Any, Callable
from integrations.erp.client import ERPConnector
from integrations.crm.client import CRMConnector
from integrations.hris.client import HRISConnector
from integrations.itsm.client import ITSMConnector
from integrations.knowledge.client import KnowledgeConnector
from integrations.comms.client import CommsConnector
from integrations.data.client import DataConnector
from rag.store import VectorStore

class ToolRegistry:
    def __init__(self):
        self.connectors = {
            "erp": ERPConnector(),
            "crm": CRMConnector(),
            "hris": HRISConnector(),
            "itsm": ITSMConnector(),
            "knowledge": KnowledgeConnector(),
            "comms": CommsConnector(),
            "data": DataConnector(),
        }
        self.vector_store = VectorStore()
        self.tools_map = {}
        self._register_tools()

    def _register_tools(self):
        for name, connector in self.connectors.items():
            tools = connector.get_tools()
            for tool_def in tools:
                tool_name = tool_def["name"]
                self.tools_map[tool_name] = {
                    "definition": tool_def,
                    "connector": connector
                }
        
        # Register RAG Search Tool
        self.tools_map["search_knowledge_base"] = {
            "definition": {
                "name": "search_knowledge_base",
                "description": "Semantically searches the internal knowledge base (Jira, Confluence, etc.) for relevant information.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The natural language query to search for."
                        }
                    },
                    "required": ["query"]
                }
            },
            "connector": self # Self-hosted tool
        }

    def get_all_tool_definitions(self) -> List[Dict[str, Any]]:
        return [t["definition"] for t in self.tools_map.values()]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools_map:
            raise ValueError(f"Tool {tool_name} not found.")
        
        tool_info = self.tools_map[tool_name]
        connector = tool_info["connector"]
        
        if tool_name == "search_knowledge_base":
            return self.vector_store.query(kwargs.get("query"))
            
        return connector.execute_tool(tool_name, **kwargs)
