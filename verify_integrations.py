import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

def test_integrations():
    print("Testing Integrations...")
    
    try:
        from integrations.erp.client import ERPConnector
        print("ERPConnector imported.")
        erp = ERPConnector()
        print("ERPConnector instantiated.")
    except Exception as e:
        print(f"ERPConnector Failed: {e}")

    try:
        from integrations.crm.client import CRMConnector
        print("CRMConnector imported.")
        crm = CRMConnector()
        print("CRMConnector instantiated.")
    except Exception as e:
        print(f"CRMConnector Failed: {e}")

    try:
        from integrations.hris.client import HRISConnector
        print("HRISConnector imported.")
        hris = HRISConnector()
        print("HRISConnector instantiated.")
    except Exception as e:
        print(f"HRISConnector Failed: {e}")

    try:
        from integrations.itsm.client import ITSMConnector
        print("ITSMConnector imported.")
        itsm = ITSMConnector()
        print("ITSMConnector instantiated.")
    except Exception as e:
        print(f"ITSMConnector Failed: {e}")

    try:
        from integrations.data.snowflake import SnowflakeConnector
        print("SnowflakeConnector imported.")
        sf = SnowflakeConnector()
        print("SnowflakeConnector instantiated.")
    except Exception as e:
        print(f"SnowflakeConnector Failed: {e}")

    try:
        from integrations.data.storage import StorageConnector
        print("StorageConnector imported.")
        storage = StorageConnector()
        print("StorageConnector instantiated.")
    except Exception as e:
        print(f"StorageConnector Failed: {e}")

    try:
        from integrations.comms.teams import TeamsConnector
        print("TeamsConnector imported.")
        teams = TeamsConnector()
        print("TeamsConnector instantiated.")
    except Exception as e:
        print(f"TeamsConnector Failed: {e}")

    try:
        from integrations.comms.slack import SlackConnector
        print("SlackConnector imported.")
        slack = SlackConnector()
        print("SlackConnector instantiated.")
    except Exception as e:
        print(f"SlackConnector Failed: {e}")

    try:
        from integrations.knowledge.sharepoint import SharePointConnector
        print("SharePointConnector imported.")
        sp = SharePointConnector()
        print("SharePointConnector instantiated.")
    except Exception as e:
        print(f"SharePointConnector Failed: {e}")

    try:
        from integrations.knowledge.confluence import ConfluenceConnector
        print("ConfluenceConnector imported.")
        conf = ConfluenceConnector()
        print("ConfluenceConnector instantiated.")
    except Exception as e:
        print(f"ConfluenceConnector Failed: {e}")

    try:
        from integrations.knowledge.jira import JiraConnector
        print("JiraConnector imported.")
        jira = JiraConnector()
        print("JiraConnector instantiated.")
    except Exception as e:
        print(f"JiraConnector Failed: {e}")

if __name__ == "__main__":
    test_integrations()
