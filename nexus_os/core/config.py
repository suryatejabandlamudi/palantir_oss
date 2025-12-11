try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus OS"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Auth
    SECRET_KEY: str = "nexus-os-super-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Integrations
    SAP_URL: Optional[str] = None
    SAP_USERNAME: Optional[str] = None
    SAP_PASSWORD: Optional[str] = None
    
    SALESFORCE_URL: Optional[str] = None
    SALESFORCE_USERNAME: Optional[str] = None
    SALESFORCE_PASSWORD: Optional[str] = None
    SALESFORCE_INSTANCE_URL: Optional[str] = None
    SALESFORCE_CLIENT_ID: Optional[str] = None
    SALESFORCE_CLIENT_SECRET: Optional[str] = None
    
    WORKDAY_URL: Optional[str] = None
    WORKDAY_USERNAME: Optional[str] = None
    WORKDAY_PASSWORD: Optional[str] = None
    WORKDAY_TENANT: Optional[str] = None
    WORKDAY_CLIENT_ID: Optional[str] = None
    WORKDAY_CLIENT_SECRET: Optional[str] = None
    WORKDAY_AUTH_URL: Optional[str] = None
    WORKDAY_API_URL: Optional[str] = None
    
    SERVICENOW_URL: Optional[str] = None
    SERVICENOW_USERNAME: Optional[str] = None
    SERVICENOW_PASSWORD: Optional[str] = None
    
    SERVICENOW_PASSWORD: Optional[str] = None

    # Microsoft Graph (Teams/Outlook)
    MS_TENANT_ID: Optional[str] = None
    MS_CLIENT_ID: Optional[str] = None
    MS_CLIENT_SECRET: Optional[str] = None
    
    # Atlassian (Jira/Confluence)
    ATLASSIAN_DOMAIN: Optional[str] = None
    ATLASSIAN_USER: Optional[str] = None
    ATLASSIAN_TOKEN: Optional[str] = None
    
    # Slack
    SLACK_BOT_TOKEN: Optional[str] = None
    
    # Snowflake
    SNOWFLAKE_ACCOUNT: Optional[str] = None
    SNOWFLAKE_USER: Optional[str] = None
    SNOWFLAKE_PRIVATE_KEY: Optional[str] = None
    SNOWFLAKE_DATABASE: Optional[str] = None
    SNOWFLAKE_SCHEMA: Optional[str] = None
    SNOWFLAKE_WAREHOUSE: Optional[str] = None
    SNOWFLAKE_JWT: Optional[str] = None # For mock/simplified auth
    
    # D365 ERP
    D365_TENANT_ID: Optional[str] = None
    D365_CLIENT_ID: Optional[str] = None
    D365_CLIENT_SECRET: Optional[str] = None
    D365_ORG_URL: Optional[str] = None
    
    # LLM
    GEMINI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    class Config:
        env_file = ".env"
        case_sensitive = True

config = Settings()
