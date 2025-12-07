from typing import Dict, Type
from .base import BaseConnector
from .postgres import PostgresConnector

class ConnectorManager:
    _connectors: Dict[str, Type[BaseConnector]] = {
        "postgres": PostgresConnector,
        # "snowflake": SnowflakeConnector,
        # "salesforce": SalesforceConnector
    }

    @classmethod
    def get_connector(cls, type_name: str) -> BaseConnector:
        connector_cls = cls._connectors.get(type_name)
        if not connector_cls:
            raise ValueError(f"Connector type '{type_name}' not supported.")
        return connector_cls()

    @classmethod
    def list_connectors(cls):
        return list(cls._connectors.keys())
