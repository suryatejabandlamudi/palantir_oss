from nexus_os.apps.aip.agent_runtime.tools import registry
from nexus_os.core.integrations.erp.client import ERPConnector
from nexus_os.core.integrations.crm.client import CRMConnector
from nexus_os.core.integrations.hris.client import HRISConnector
from nexus_os.core.integrations.itsm.client import ITSMConnector

def register_integrations():
    """
    Instantiates integration connectors and registers their tools with the global registry.
    """
    connectors = [
        ERPConnector(),
        CRMConnector(),
        HRISConnector(),
        ITSMConnector()
    ]

    for connector in connectors:
        # Skip if client is not configured (optional, but good for stability)
        if not connector.client:
            print(f"Skipping {connector.__class__.__name__} due to missing credentials.")
            continue

        tools = connector.get_tools()
        for tool_def in tools:
            name = tool_def["name"]
            description = tool_def["description"]
            parameters = tool_def["parameters"]
            
            # Create a closure to capture connector and tool_name
            def make_tool_func(conn, t_name):
                def tool_func(**kwargs):
                    return conn.execute_tool(t_name, **kwargs)
                return tool_func
            
            func = make_tool_func(connector, name)
            
            # Register with the registry
            # registry.register returns a decorator, so we call it with the function
            registry.register(name, description, parameters)(func)
            print(f"Registered tool: {name}")

# Auto-register on import? 
# Better to have an explicit init function called by the app startup.
