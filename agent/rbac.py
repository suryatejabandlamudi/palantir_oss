from enum import Enum
from typing import List, Dict

class UserRole(Enum):
    ADMIN = "admin"
    HR_MANAGER = "hr_manager"
    SUPPLY_CHAIN_MANAGER = "supply_chain_manager"
    SALES_REP = "sales_rep"
    IT_ADMIN = "it_admin"
    EXECUTIVE = "executive"

# Define default access policies
# This maps roles to a list of allowed tool names.
# "*" means access to all tools.
ROLE_PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.ADMIN: ["*"],
    UserRole.HR_MANAGER: [
        "get_employee_details",
        "search_knowledge_base",
        "send_message",
        "list_open_positions",
        "send_slack_message",
        "list_slack_channels",
        "send_teams_message",
        "list_teams_chats",
        "list_onedrive_files",
        "read_onedrive_file",
        "search_sharepoint_sites"
    ],
    UserRole.SUPPLY_CHAIN_MANAGER: [
        "get_inventory",
        "create_purchase_order",
        "search_knowledge_base",
        "send_message",
        "send_slack_message",
        "list_slack_channels",
        "send_teams_message",
        "list_teams_chats",
        "list_onedrive_files",
        "read_onedrive_file",
        "search_sharepoint_sites"
    ],
    UserRole.SALES_REP: [
        "get_customer_details",
        "create_quote",
        "search_knowledge_base",
        "send_message",
        "send_slack_message",
        "list_slack_channels",
        "send_teams_message",
        "list_teams_chats",
        "list_onedrive_files",
        "read_onedrive_file",
        "search_sharepoint_sites"
    ],
    UserRole.IT_ADMIN: [
        "get_ticket_status",
        "create_ticket",
        "search_knowledge_base",
        "send_message",
        "send_slack_message",
        "list_slack_channels",
        "send_teams_message",
        "list_teams_chats",
        "list_onedrive_files",
        "read_onedrive_file",
        "search_sharepoint_sites",
        "data_list_s3_files"
    ],
    UserRole.EXECUTIVE: [
        "erp_get_receivables",
        "crm_get_opportunities",
        "data_query_snowflake",
        "search_knowledge_base",
        "send_slack_message",
        "list_slack_channels",
        "send_teams_message",
        "list_teams_chats",
        "list_onedrive_files",
        "read_onedrive_file",
        "search_sharepoint_sites"
    ]
}

def check_access(role: UserRole, tool_name: str) -> bool:
    """
    Checks if a user with the given role has access to the specified tool.
    """
    if role == UserRole.ADMIN:
        return True
    
    allowed_tools = ROLE_PERMISSIONS.get(role, [])
    if "*" in allowed_tools:
        return True
        
    return tool_name in allowed_tools
