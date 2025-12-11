from typing import List, Dict, Any, Optional
from nexus_os.core.integrations.base import BaseConnector
from nexus_os.core.config import config

# Try importing external libraries, handle missing deps gracefully
try:
    import snowflake.connector
except ImportError:
    snowflake = None

try:
    import boto3
except ImportError:
    boto3 = None

class DataConnector(BaseConnector):
    """
    Real Connector for Data Layer (Snowflake, S3).
    """

    def __init__(self):
        super().__init__()
        self.snowflake_conn = None
        self.s3_client = None

        # Initialize Snowflake
        if config.SNOWFLAKE_USER and config.SNOWFLAKE_PASSWORD and config.SNOWFLAKE_ACCOUNT:
            if snowflake:
                try:
                    self.snowflake_conn = snowflake.connector.connect(
                        user=config.SNOWFLAKE_USER,
                        password=config.SNOWFLAKE_PASSWORD,
                        account=config.SNOWFLAKE_ACCOUNT,
                        warehouse=config.SNOWFLAKE_WAREHOUSE,
                        database=config.SNOWFLAKE_DATABASE,
                        schema=config.SNOWFLAKE_SCHEMA
                    )
                except Exception as e:
                    print(f"Error connecting to Snowflake: {e}")
            else:
                print("WARNING: 'snowflake-connector-python' not installed.")
        else:
            print("WARNING: Snowflake credentials not found.")

        # Initialize S3
        if config.AWS_ACCESS_KEY_ID and config.AWS_SECRET_ACCESS_KEY:
            if boto3:
                try:
                    self.s3_client = boto3.client(
                        's3',
                        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
                        region_name=config.AWS_REGION
                    )
                except Exception as e:
                    print(f"Error connecting to S3: {e}")
            else:
                print("WARNING: 'boto3' not installed.")
        else:
            print("WARNING: AWS credentials not found.")

    def get_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "data_query_snowflake",
                "description": "Executes a SQL query against the Snowflake Data Warehouse.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The SQL query to execute."
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "data_list_s3_files",
                "description": "Lists files in the configured S3 bucket.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prefix": {
                            "type": "string",
                            "description": "Optional prefix to filter files."
                        }
                    }
                }
            }
            {
                "name": "data_search_sharepoint",
                "description": "Searches for files in SharePoint.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query."}
                    },
                    "required": ["query"]
                }
            }
        ]

    def execute_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name == "data_query_snowflake":
            return self._query_snowflake(kwargs.get("query"))
        elif tool_name == "data_list_s3_files":
            return self._list_s3_files(kwargs.get("prefix", ""))
        elif tool_name == "data_search_sharepoint":
            return self._search_sharepoint(kwargs.get("query"))
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _search_sharepoint(self, query: str) -> List[Dict[str, Any]]:
        # Requires Graph API access, reusing logic or assuming a client exists.
        # For now, returning a placeholder as we need to inject the Graph Client here or duplicate auth.
        return [{"error": "SharePoint search requires Graph API client injection. Pending refactor."}]

    def _query_snowflake(self, query: str) -> List[Dict[str, Any]]:
        if not self.snowflake_conn:
            return "Error: Snowflake not configured or library missing."
        
        try:
            cursor = self.snowflake_conn.cursor()
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            return results
        except Exception as e:
            return f"Error executing Snowflake query: {e}"

    def _list_s3_files(self, prefix: str) -> List[str]:
        if not self.s3_client:
            return "Error: S3 not configured or library missing."
        
        bucket = config.S3_BUCKET_NAME
        if not bucket:
            return "Error: S3_BUCKET_NAME not set."

        try:
            response = self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
            if 'Contents' not in response:
                return []
            return [obj['Key'] for obj in response['Contents']]
        except Exception as e:
            return f"Error listing S3 files: {e}"
