from typing import Dict, Any, Optional
import os
from nexus_os.core.integrations.crm.client import CRMConnector
from nexus_os.core.integrations.itsm.client import ITSMConnector
from nexus_os.core.integrations.hris.client import HRISConnector
from nexus_os.core.integrations.comms.teams import TeamsConnector
from nexus_os.core.integrations.comms.slack import SlackConnector
from nexus_os.core.integrations.erp.sap import SAPConnector

class IntegrationManager:
    """
    Central hub for managing authentications and dispatching calls to 
    various 3rd party integrations.
    """
    def __init__(self):
        self._load_credentials()
        self.connectors = {}
        self._initialize_connectors()

    def _load_credentials(self):
        """
        Loads credentials from environment variables or .env file.
        In a real production app, this might fetch from a Vault.
        """
        # Python-dotenv loading is handled at app startup usually, 
        # but we ensure environment is checked here.
        pass

    def _initialize_connectors(self):
        """
        Initializes all available connectors.
        """
        # CRM (Salesforce)
        try:
            self.connectors["crm"] = CRMConnector()
        except Exception as e:
            print(f"Failed to init CRM: {e}")

        # ITSM (ServiceNow)
        try:
            self.connectors["itsm"] = ITSMConnector()
        except Exception as e:
            print(f"Failed to init ITSM: {e}")

        # HRIS (Workday)
        try:
            self.connectors["hris"] = HRISConnector()
        except Exception as e:
            print(f"Failed to init HRIS: {e}")

        # Comms (Teams)
        try:
            self.connectors["teams"] = TeamsConnector()
        except Exception as e:
            print(f"Failed to init Teams: {e}")

        # Comms (Slack)
        try:
            self.connectors["slack"] = SlackConnector()
        except Exception as e:
            print(f"Failed to init Slack: {e}")

        # ERP (SAP)
        try:
            self.connectors["sap"] = SAPConnector()
        except Exception as e:
            print(f"Failed to init SAP: {e}")

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Dispatches a tool call to the appropriate connector.
        """
        # Simple routing based on prefix
        if tool_name.startswith("crm_"):
            return self.connectors["crm"].execute_tool(tool_name, **arguments)
        elif tool_name.startswith("itsm_"):
            return self.connectors["itsm"].execute_tool(tool_name, **arguments)
        elif tool_name.startswith("hris_"):
            return self.connectors["hris"].execute_tool(tool_name, **arguments)
        elif tool_name.startswith("teams_"):
            return self.connectors["teams"].execute_tool(tool_name, **arguments)
        elif tool_name.startswith("slack_"):
            return self.connectors["slack"].execute_tool(tool_name, **arguments)
        elif tool_name.startswith("sap_"):
            return self.connectors["sap"].execute_tool(tool_name, **arguments)
        else:
            return f"Error: No connector found for tool '{tool_name}'"

    def get_all_tools_definitions(self):
        """
        Returns schemas for all active tools.
        """
        tools = []
        for name, connector in self.connectors.items():
            if connector.client: # Only include if successfully connected/configured
                tools.extend(connector.get_tools())
        return tools
