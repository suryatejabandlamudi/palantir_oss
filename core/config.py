import os
from typing import Optional

class Config:
    """
    Centralized configuration for the application.
    Loads values from environment variables.
    """
    
    # LLM
    GEMINI_API_KEY: Optional[str] = os.environ.get("GEMINI_API_KEY")
    LLM_PROVIDER: str = os.environ.get("LLM_PROVIDER", "gemini") # gemini or ollama
    OLLAMA_BASE_URL: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.environ.get("OLLAMA_MODEL", "gpt-oss:20b")

    # ERP (Dynamics 365)
    D365_TENANT_ID: Optional[str] = os.environ.get("D365_TENANT_ID")
    D365_CLIENT_ID: Optional[str] = os.environ.get("D365_CLIENT_ID")
    D365_CLIENT_SECRET: Optional[str] = os.environ.get("D365_CLIENT_SECRET")
    D365_ENVIRONMENT: str = os.environ.get("D365_ENVIRONMENT", "Production")

    # CRM (Salesforce)
    SALESFORCE_INSTANCE_URL: Optional[str] = os.environ.get("SALESFORCE_INSTANCE_URL")
    SALESFORCE_CLIENT_ID: Optional[str] = os.environ.get("SALESFORCE_CLIENT_ID")
    SALESFORCE_CLIENT_SECRET: Optional[str] = os.environ.get("SALESFORCE_CLIENT_SECRET")
    
    # HRIS (Workday)
    WORKDAY_TENANT: Optional[str] = os.environ.get("WORKDAY_TENANT")
    WORKDAY_CLIENT_ID: Optional[str] = os.environ.get("WORKDAY_CLIENT_ID")
    WORKDAY_CLIENT_SECRET: Optional[str] = os.environ.get("WORKDAY_CLIENT_SECRET")

    # ITSM (ServiceNow)
    SERVICENOW_INSTANCE: Optional[str] = os.environ.get("SERVICENOW_INSTANCE")
    SERVICENOW_CLIENT_ID: Optional[str] = os.environ.get("SERVICENOW_CLIENT_ID")
    SERVICENOW_CLIENT_SECRET: Optional[str] = os.environ.get("SERVICENOW_CLIENT_SECRET")

    # Knowledge (Atlassian)
    ATLASSIAN_DOMAIN: Optional[str] = os.environ.get("ATLASSIAN_DOMAIN")
    ATLASSIAN_EMAIL: Optional[str] = os.environ.get("ATLASSIAN_EMAIL")
    ATLASSIAN_API_TOKEN: Optional[str] = os.environ.get("ATLASSIAN_API_TOKEN")

    # Comms (Microsoft Graph)
    GRAPH_TENANT_ID: str = os.getenv("GRAPH_TENANT_ID")
    GRAPH_CLIENT_ID: str = os.getenv("GRAPH_CLIENT_ID")
    GRAPH_CLIENT_SECRET: str = os.getenv("GRAPH_CLIENT_SECRET")

    # Comms (Slack)
    SLACK_BOT_TOKEN: str = os.getenv("SLACK_BOT_TOKEN")

    # Data (Snowflake)
    SNOWFLAKE_USER: str = os.getenv("SNOWFLAKE_USER")
    SNOWFLAKE_PASSWORD: str = os.getenv("SNOWFLAKE_PASSWORD")
    SNOWFLAKE_ACCOUNT: str = os.getenv("SNOWFLAKE_ACCOUNT")
    SNOWFLAKE_WAREHOUSE: str = os.getenv("SNOWFLAKE_WAREHOUSE")
    SNOWFLAKE_DATABASE: str = os.getenv("SNOWFLAKE_DATABASE")
    SNOWFLAKE_SCHEMA: str = os.getenv("SNOWFLAKE_SCHEMA")

    # Data (S3)
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME")

    # Aliases and Missing Vars for Connectors
    SF_CLIENT_ID = SALESFORCE_CLIENT_ID
    SF_CLIENT_SECRET = SALESFORCE_CLIENT_SECRET
    SF_INSTANCE_URL = SALESFORCE_INSTANCE_URL

    WD_CLIENT_ID = WORKDAY_CLIENT_ID
    WD_CLIENT_SECRET = WORKDAY_CLIENT_SECRET
    WD_TENANT = WORKDAY_TENANT
    WD_AUTH_URL = os.environ.get("WD_AUTH_URL", "https://impl.workday.com/ccx/service/auth")
    WD_API_URL = os.environ.get("WD_API_URL", "https://impl.workday.com")

    SN_INSTANCE = SERVICENOW_INSTANCE
    SN_USERNAME = os.environ.get("SERVICENOW_USERNAME", "admin")
    SN_PASSWORD = os.environ.get("SERVICENOW_PASSWORD", "admin")

    ATLASSIAN_USER = ATLASSIAN_EMAIL
    ATLASSIAN_TOKEN = ATLASSIAN_API_TOKEN

    MS_TENANT_ID = GRAPH_TENANT_ID
    MS_CLIENT_ID = GRAPH_CLIENT_ID
    MS_CLIENT_SECRET = GRAPH_CLIENT_SECRET

    S3_BUCKET = S3_BUCKET_NAME
    S3_REGION = AWS_REGION

    SNOWFLAKE_PRIVATE_KEY = os.environ.get("SNOWFLAKE_PRIVATE_KEY")
    SNOWFLAKE_JWT = os.environ.get("SNOWFLAKE_JWT")

    @classmethod
    def validate(cls):
        """
        Validates that critical configuration is present.
        """
        missing = []
        if not cls.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        
        if missing:
            print(f"WARNING: Missing configuration variables: {', '.join(missing)}")

config = Config()
