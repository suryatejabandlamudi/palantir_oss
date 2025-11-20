from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseConnector(ABC):
    """
    Abstract base class for all product integrations.
    Enforces a standard structure for exposing tools to the agent.
    """

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}

    @abstractmethod
    def get_tools(self) -> List[Dict[str, Any]]:
        """
        Returns a list of tool definitions (JSON schema) that this connector exposes.
        """
        pass

    @abstractmethod
    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """
        Executes a specific tool by name with the provided arguments.
        """
        pass
