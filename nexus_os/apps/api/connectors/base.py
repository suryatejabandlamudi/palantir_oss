from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseConnector(ABC):
    """
    Abstract Base Class for all Data Connectors.
    Mimics Airbyte's Source interface.
    """
    
    @abstractmethod
    def check_connection(self, config: Dict[str, Any]) -> bool:
        """
        Validates the connection configuration.
        """
        pass

    @abstractmethod
    def discover_schema(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Returns a list of available streams (tables) and their schemas.
        """
        pass

    @abstractmethod
    def read(self, config: Dict[str, Any], stream_name: str) -> List[Dict[str, Any]]:
        """
        Reads data from a specific stream.
        Returns a list of records (dicts).
        """
        pass
