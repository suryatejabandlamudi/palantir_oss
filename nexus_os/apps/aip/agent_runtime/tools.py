from typing import Callable, Dict, Any, List, Optional
from functools import wraps
from nexus_os.apps.aip.agent_runtime.rbac import UserRole, check_access

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, description: str, parameters: Dict[str, Any] = None):
        """
        Decorator to register a function as a tool.
        
        Args:
            name: The name of the tool (must match what's used in RBAC).
            description: A description of what the tool does.
            parameters: A JSON schema defining the tool's parameters.
        """
        def decorator(func: Callable):
            self._tools[name] = {
                "name": name,
                "description": description,
                "func": func,
                "parameters": parameters or {"type": "object", "properties": {}}
            }
            
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return decorator

    def get_tools_for_role(self, role: UserRole) -> List[Dict[str, Any]]:
        """
        Returns the list of tool definitions allowed for the given role.
        Formatted for the Gemini API.
        """
        allowed_tools = []
        for name, tool_def in self._tools.items():
            if check_access(role, name):
                allowed_tools.append({
                    "name": name,
                    "description": tool_def["description"],
                    "parameters": tool_def["parameters"]
                })
        return allowed_tools

    def execute(self, name: str, arguments: Dict[str, Any], user_role: UserRole = None) -> Any:
        """
        Executes a tool by name, ensuring the user has access.
        """
        if name not in self._tools:
            raise ValueError(f"Tool {name} not found")
        
        if user_role and not check_access(user_role, name):
             raise PermissionError(f"Role {user_role.value} cannot access tool {name}")
             
        func = self._tools[name]["func"]
        return func(**arguments)

# Global registry instance
registry = ToolRegistry()

# --- Register Collaboration Tools ---
from nexus_os.apps.aip.agent_runtime import tools_integration

registry.register("send_slack_message", "Send a message to a Slack channel", {
    "type": "object",
    "properties": {
        "channel": {"type": "string", "description": "The channel name (e.g., #general)"},
        "message": {"type": "string", "description": "The message content"}
    },
    "required": ["channel", "message"]
})(tools_integration.send_slack_message)

registry.register("list_slack_channels", "List available Slack channels")(tools_integration.list_slack_channels)

registry.register("send_teams_message", "Send a message to a Microsoft Teams chat", {
    "type": "object",
    "properties": {
        "chat_id": {"type": "string", "description": "The chat ID"},
        "message": {"type": "string", "description": "The message content"}
    },
    "required": ["chat_id", "message"]
})(tools_integration.send_teams_message)

registry.register("list_teams_chats", "List recent Microsoft Teams chats")(tools_integration.list_teams_chats)

registry.register("list_onedrive_files", "List files in a OneDrive folder", {
    "type": "object",
    "properties": {
        "folder": {"type": "string", "description": "The folder path (default: /)"}
    }
})(tools_integration.list_onedrive_files)

registry.register("read_onedrive_file", "Read the content of a file from OneDrive", {
    "type": "object",
    "properties": {
        "filename": {"type": "string", "description": "The name of the file to read"}
    },
    "required": ["filename"]
})(tools_integration.read_onedrive_file)

registry.register("search_sharepoint_sites", "Search for SharePoint sites", {
    "type": "object",
    "properties": {
        "query": {"type": "string", "description": "The search query"}
    },
    "required": ["query"]
})(tools_integration.search_sharepoint_sites)
