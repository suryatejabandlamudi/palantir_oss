from nexus_os.apps.aip.agent_runtime.tools import registry

# Import Connectors
try:
    from nexus_os.core.integrations.erp.sap import SAPConnector
except ImportError as e:
    print(f"SAP Import Error: {e}")
    SAPConnector = None

try:
    from nexus_os.core.integrations.crm.salesforce import SalesforceConnector
except ImportError as e:
    print(f"Salesforce Import Error: {e}")
    SalesforceConnector = None

try:
    from nexus_os.core.integrations.hris.workday import WorkdayConnector
except ImportError as e:
    print(f"Workday Import Error: {e}")
    WorkdayConnector = None

try:
    from nexus_os.core.integrations.itsm.client import ITSMConnector
except ImportError as e:
    print(f"ServiceNow Import Error: {e}")
    ITSMConnector = None

try:
    from nexus_os.core.integrations.knowledge.jira import JiraConnector
except ImportError as e:
    print(f"Jira Import Error: {e}")
    JiraConnector = None

try:
    from nexus_os.core.integrations.knowledge.confluence import ConfluenceConnector
except ImportError as e:
    print(f"Confluence Import Error: {e}")
    ConfluenceConnector = None

try:
    from nexus_os.core.integrations.comms.slack import SlackConnector
except ImportError as e:
    print(f"Slack Import Error: {e}")
    SlackConnector = None

try:
    from nexus_os.core.integrations.data.snowflake import SnowflakeConnector
except ImportError as e:
    print(f"Snowflake Import Error: {e}")
    SnowflakeConnector = None

def register_all_connectors():
    """
    Instantiates all available connectors and registers their tools to the global registry.
    """
    print("--- Initializing Registry with Enterprise Connectors ---")
    
    # helper for registration
    def register_connector_tools(connector, connector_name):
        if not connector:
            print(f"Skipping {connector_name}: Class not imported.")
            return

        try:
            instance = connector()
            tools = instance.get_tools()
            for tool_def in tools:
                name = tool_def["name"]
                description = tool_def["description"]
                parameters = tool_def.get("parameters")
                
                # We register a wrapper that calls instance.execute_tool
                # But execute_tool takes (tool_name, **kwargs).
                # The registry expects a callable that takes arguments matching 'parameters'.
                # We need a dynamic wrapper.
                
                def make_wrapper(inst, t_name):
                    def wrapper(**kwargs):
                        return inst.execute_tool(t_name, **kwargs)
                    return wrapper
                
                tool_func = make_wrapper(instance, name)
                
                # Register
                registry.register(name, description, parameters)(tool_func)
                print(f"Registered tool: {name}")
                
        except Exception as e:
            print(f"Error registering {connector_name}: {e}")

    register_connector_tools(SAPConnector, "SAP")
    register_connector_tools(SalesforceConnector, "Salesforce")
    register_connector_tools(WorkdayConnector, "Workday")
    register_connector_tools(ITSMConnector, "ServiceNow")
    register_connector_tools(JiraConnector, "Jira")
    register_connector_tools(ConfluenceConnector, "Confluence")
    register_connector_tools(SlackConnector, "Slack")
    register_connector_tools(SnowflakeConnector, "Snowflake")

# Run registration on import
register_all_connectors()
