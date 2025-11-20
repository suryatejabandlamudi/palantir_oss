from fastmcp import FastMCP
from agent.tools import ToolRegistry

# Initialize FastMCP server
mcp = FastMCP("Palantir OSS Integrations")

# Initialize our Tool Registry which holds all connectors
registry = ToolRegistry()

# Register all tools from the registry to FastMCP
# We iterate through our internal tool definitions and wrap them
for tool_name, tool_info in registry.tools_map.items():
    tool_def = tool_info["definition"]
    connector = tool_info["connector"]
    
    # We define a wrapper function that calls our connector
    # Note: FastMCP uses type hints for validation, but since we are dynamic here,
    # we might need a more manual registration or a generic wrapper.
    # For simplicity in this "Real" implementation, we will register specific high-value tools explicitly
    # to ensure proper typing and description support in MCP clients.

    # ERP Tools
    if tool_name == "erp_get_sales_orders":
        @mcp.tool(name="erp_get_sales_orders", description=tool_def["description"])
        def erp_get_sales_orders(customer_id: str = None) -> str:
            return str(connector.execute_tool("erp_get_sales_orders", customer_id=customer_id))

    elif tool_name == "erp_get_inventory":
        @mcp.tool(name="erp_get_inventory", description=tool_def["description"])
        def erp_get_inventory(item_id: str = None) -> str:
            return str(connector.execute_tool("erp_get_inventory", item_id=item_id))

    # CRM Tools
    elif tool_name == "crm_search_opportunities":
        @mcp.tool(name="crm_search_opportunities", description=tool_def["description"])
        def crm_search_opportunities(query: str) -> str:
            return str(connector.execute_tool("crm_search_opportunities", query=query))

    elif tool_name == "crm_create_opportunity":
        @mcp.tool(name="crm_create_opportunity", description=tool_def["description"])
        def crm_create_opportunity(name: str, amount: float, close_date: str, stage: str = "Prospecting") -> str:
            return str(connector.execute_tool("crm_create_opportunity", name=name, amount=amount, close_date=close_date, stage=stage))

    # HRIS Tools
    elif tool_name == "hris_get_employee_profile":
        @mcp.tool(name="hris_get_employee_profile", description=tool_def["description"])
        def hris_get_employee_profile(name: str = None, email: str = None) -> str:
            return str(connector.execute_tool("hris_get_employee_profile", name=name, email=email))

    # ITSM Tools
    elif tool_name == "itsm_search_incidents":
        @mcp.tool(name="itsm_search_incidents", description=tool_def["description"])
        def itsm_search_incidents(query: str, limit: int = 5) -> str:
            return str(connector.execute_tool("itsm_search_incidents", query=query, limit=limit))

    elif tool_name == "itsm_create_incident":
        @mcp.tool(name="itsm_create_incident", description=tool_def["description"])
        def itsm_create_incident(short_description: str, description: str = "", urgency: str = "3", impact: str = "3") -> str:
            return str(connector.execute_tool("itsm_create_incident", short_description=short_description, description=description, urgency=urgency, impact=impact))

    # Knowledge Tools
    elif tool_name == "knowledge_search_jira":
        @mcp.tool(name="knowledge_search_jira", description=tool_def["description"])
        def knowledge_search_jira(jql: str) -> str:
            return str(connector.execute_tool("knowledge_search_jira", jql=jql))

    elif tool_name == "knowledge_search_confluence":
        @mcp.tool(name="knowledge_search_confluence", description=tool_def["description"])
        def knowledge_search_confluence(query: str) -> str:
            return str(connector.execute_tool("knowledge_search_confluence", query=query))

    # Comms Tools
    elif tool_name == "comms_send_message":
        @mcp.tool(name="comms_send_message", description=tool_def["description"])
        def comms_send_message(team_id: str, channel_id: str, message: str) -> str:
            return str(connector.execute_tool("comms_send_message", team_id=team_id, channel_id=channel_id, message=message))

    elif tool_name == "comms_send_slack_message":
        @mcp.tool(name="comms_send_slack_message", description=tool_def["description"])
        def comms_send_slack_message(channel: str, text: str) -> str:
            return str(connector.execute_tool("comms_send_slack_message", channel=channel, text=text))

    elif tool_name == "comms_send_email":
        @mcp.tool(name="comms_send_email", description=tool_def["description"])
        def comms_send_email(to: str, subject: str, body: str) -> str:
            return str(connector.execute_tool("comms_send_email", to=to, subject=subject, body=body))

    # Data Tools
    elif tool_name == "data_query_snowflake":
        @mcp.tool(name="data_query_snowflake", description=tool_def["description"])
        def data_query_snowflake(query: str) -> str:
            return str(connector.execute_tool("data_query_snowflake", query=query))

    elif tool_name == "data_list_s3_files":
        @mcp.tool(name="data_list_s3_files", description=tool_def["description"])
        def data_list_s3_files(prefix: str = "") -> str:
            return str(connector.execute_tool("data_list_s3_files", prefix=prefix))

    elif tool_name == "data_search_sharepoint":
        @mcp.tool(name="data_search_sharepoint", description=tool_def["description"])
        def data_search_sharepoint(query: str) -> str:
            return str(connector.execute_tool("data_search_sharepoint", query=query))

    # ERP Extended
    elif tool_name == "erp_get_general_ledger":
        @mcp.tool(name="erp_get_general_ledger", description=tool_def["description"])
        def erp_get_general_ledger(account_no: str = None) -> str:
            return str(connector.execute_tool("erp_get_general_ledger", account_no=account_no))

    # HRIS Extended
    elif tool_name == "hris_get_time_off_balance":
        @mcp.tool(name="hris_get_time_off_balance", description=tool_def["description"])
        def hris_get_time_off_balance(employee_id: str) -> str:
            return str(connector.execute_tool("hris_get_time_off_balance", employee_id=employee_id))

    elif tool_name == "hris_get_payroll_summary":
        @mcp.tool(name="hris_get_payroll_summary", description=tool_def["description"])
        def hris_get_payroll_summary(employee_id: str) -> str:
            return str(connector.execute_tool("hris_get_payroll_summary", employee_id=employee_id))

    # RAG Tools
    elif tool_name == "search_knowledge_base":
        @mcp.tool(name="search_knowledge_base", description=tool_def["description"])
        def search_knowledge_base(query: str) -> str:
            return str(registry.execute_tool("search_knowledge_base", query=query))

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()
