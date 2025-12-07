import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from nexus_os.apps.aip.agent_runtime.tools import registry
from nexus_os.apps.aip.agent_runtime.rbac import UserRole

def verify_tools():
    print("Verifying Collaboration Tools...")
    
    # Test Slack
    print("\nTesting Slack:")
    try:
        res = registry.execute("send_slack_message", {"channel": "#general", "message": "Hello"}, UserRole.HR_MANAGER)
        print(f"SUCCESS: {res}")
    except Exception as e:
        print(f"FAILED: {e}")

    # Test Teams
    print("\nTesting Teams:")
    try:
        res = registry.execute("send_teams_message", {"chat_id": "chat-1", "message": "Hello"}, UserRole.SUPPLY_CHAIN_MANAGER)
        print(f"SUCCESS: {res}")
    except Exception as e:
        print(f"FAILED: {e}")

    # Test OneDrive
    print("\nTesting OneDrive:")
    try:
        res = registry.execute("list_onedrive_files", {}, UserRole.SALES_REP)
        print(f"SUCCESS: {res}")
    except Exception as e:
        print(f"FAILED: {e}")

    # Test SharePoint
    print("\nTesting SharePoint:")
    try:
        res = registry.execute("search_sharepoint_sites", {"query": "policy"}, UserRole.IT_ADMIN)
        print(f"SUCCESS: {res}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    verify_tools()
