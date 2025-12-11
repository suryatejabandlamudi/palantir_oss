from typing import List, Dict, Any
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.client import APIClient
from nexus_os.core.auth import AuthProvider
from nexus_os.core.config import config
import json

class SnowflakeAuthProvider(AuthProvider):
    def __init__(self, token: str):
        self.token = token

    def get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.token}",
            "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT" 
        }

class SnowflakeConnector(BaseConnector):
    """
    Real Connector for Snowflake Data Warehouse using SQL API.
    """

    def __init__(self):
        super().__init__()
        if config.SNOWFLAKE_ACCOUNT and config.SNOWFLAKE_USER and config.SNOWFLAKE_PRIVATE_KEY:
            # Snowflake SQL API
            # https://docs.snowflake.com/en/developer-guide/sql-api/index
            
            # Authentication for Snowflake SQL API is complex (Key Pair -> JWT).
            # Assuming we have a helper or pre-generated JWT for simplicity in this demo,
            # or we'd need `cryptography` lib to generate JWT from private key.
            # For now, we'll assume config.SNOWFLAKE_JWT is available or we use a placeholder.
            
            token = config.SNOWFLAKE_JWT or "placeholder_jwt"
            self.auth = SnowflakeAuthProvider(token)
            
            account = config.SNOWFLAKE_ACCOUNT # e.g. xy12345.us-east-1
            self.client = APIClient(
                base_url=f"https://{account}.snowflakecomputing.com/api/v2",
                auth_provider=self.auth
            )
        else:
            print("WARNING: Snowflake credentials not found. SnowflakeConnector will fail if used.")
            self.client = None

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "snowflake_query",
                "description": "Executes a SQL query in Snowflake.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "statement": {"type": "string", "description": "The SQL statement to execute."},
                        "database": {"type": "string"},
                        "schema": {"type": "string"},
                        "warehouse": {"type": "string"}
                    },
                    "required": ["statement"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if not self.client:
            return "Error: Snowflake credentials not configured."

        if tool_name == "snowflake_query":
            return self._execute_query(
                kwargs.get("statement"),
                kwargs.get("database"),
                kwargs.get("schema"),
                kwargs.get("warehouse")
            )
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _execute_query(self, statement: str, database: str = None, schema: str = None, warehouse: str = None) -> Dict[str, Any]:
        endpoint = "statements"
        payload = {
            "statement": statement,
            "timeout": 60,
            "database": database or config.SNOWFLAKE_DATABASE,
            "schema": schema or config.SNOWFLAKE_SCHEMA,
            "warehouse": warehouse or config.SNOWFLAKE_WAREHOUSE
        }
        
        # Filter out None values
        payload = {k: v for k, v in payload.items() if v is not None}
        
        data = self.client.post(endpoint, json=payload)
        if not data: return {"error": "Query execution failed"}
        
        return {
            "resultSetMetaData": data.get("resultSetMetaData"),
            "data": data.get("data"),
            "code": data.get("code"),
            "message": data.get("message")
        }
