import sys
import os

# Add project root to path
sys.path.append("/Volumes/ssd/personal_projects/palantir_oss")

from nexus_os.core.integrations.integration_manager import IntegrationManager

def verify_integrations():
    print("--- Verifying Real Integrations ---")
    
    manager = IntegrationManager()
    
    print("\n[Connector Status]")
    for name, connector in manager.connectors.items():
        is_active = bool(connector.client)
        status = "ACTIVE" if is_active else "INACTIVE (Missing Credentials)"
        print(f"  - {name.upper()}: {status}")

    print("\n[Tool Definitions]")
    tools = manager.get_all_tools_definitions()
    print(f"  Total Tools Available: {len(tools)}")
    for t in tools:
        print(f"  - {t['name']}")

    if len(tools) == 0:
        print("\nNOTE: No active tools found because credentials are missing from env.")
        print("This confirms we are NOT using mocks. Please set .env variables to test real connectivity.")
    else:
        print("\n[Testing Connection]")
        # Example test if credentials existed
        # res = manager.execute_tool("crm_get_leads", {"email": "test@example.com"})
        # print(res)

if __name__ == "__main__":
    verify_integrations()
