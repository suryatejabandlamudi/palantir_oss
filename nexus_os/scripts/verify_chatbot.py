from fastapi.testclient import TestClient
from api import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
    print("Health check passed.")

@patch("api.llm_client")
@patch("api.tool_registry")
def test_chat_rbac(mock_registry, mock_llm):
    # Mock LLM response
    mock_llm.generate_response.return_value = {
        "content": "I will check the inventory.",
        "tool_calls": [{
            "name": "erp_get_inventory",
            "arguments": {"item_id": "123"}
        }]
    }
    
    # Mock Tool Execution
    mock_registry.execute_tool.return_value = "Inventory: 50 units"
    mock_registry.get_all_tool_definitions.return_value = [
        {"name": "erp_get_inventory", "description": "Get inventory"},
        {"name": "hris_get_employee", "description": "Get employee"}
    ]

    # Test 1: Supply Chain Manager (Allowed to use ERP)
    print("Testing Supply Chain Manager (Allowed)...")
    response = client.post("/chat", json={
        "message": "Check inventory for item 123",
        "role": "supply_chain_manager"
    })
    assert response.status_code == 200
    data = response.json()
    assert "Inventory: 50 units" in str(data["tool_calls"])
    print("Supply Chain Manager test passed.")

    # Test 2: HR Manager (Not Allowed to use ERP)
    print("Testing HR Manager (Denied)...")
    # Reset mocks
    mock_llm.generate_response.return_value = {
        "content": "I will try to check inventory.",
        "tool_calls": [{
            "name": "erp_get_inventory",
            "arguments": {"item_id": "123"}
        }]
    }
    
    response = client.post("/chat", json={
        "message": "Check inventory for item 123",
        "role": "hr_manager"
    })
    assert response.status_code == 200
    data = response.json()
    # The tool execution result in the response should indicate permission error
    # In our implementation, we catch the permission error and return it as the tool result
    tool_result = data["tool_calls"][0]["result"]
    assert "Error: You do not have permission" in tool_result
    print("HR Manager RBAC test passed.")

if __name__ == "__main__":
    test_health()
    test_chat_rbac()
