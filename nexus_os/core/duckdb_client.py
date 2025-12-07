import duckdb
import pandas as pd
import json
from typing import List, Dict, Any, Optional

class DuckDBClient:
    def __init__(self, db_path: str = "nexus.duckdb"):
        self.conn = duckdb.connect(db_path)
        
    def create_object_table(self, object_type: str, properties: Any):
        """
        Creates a table for a specific Object Type.
        Properties can be a Dict or a List of definitions.
        Handles schema evolution by adding missing columns.
        """
        # 1. Define desired columns
        desired_columns = {"id": "VARCHAR", "title": "VARCHAR"}
        
        # Simple type mapping
        type_map = {
            "string": "VARCHAR",
            "integer": "BIGINT",
            "float": "DOUBLE",
            "boolean": "BOOLEAN",
            "date": "DATE",
            "timestamp": "TIMESTAMP"
        }
        
        # Handle List of PropertyDefinition (Pydantic or Dict)
        if isinstance(properties, list):
            for prop in properties:
                # prop might be a Pydantic model or a dict
                if hasattr(prop, "name"):
                    p_name = prop.name
                    p_type = prop.type
                else:
                    p_name = prop.get("name")
                    p_type = prop.get("type")
                
                dtype = type_map.get(p_type, "VARCHAR")
                desired_columns[p_name] = dtype
        elif isinstance(properties, dict):
             for prop_name, prop_def in properties.items():
                dtype = type_map.get(prop_def.get("type", "string"), "VARCHAR")
                desired_columns[prop_name] = dtype
            
        # 2. Check if table exists
        table_exists = False
        try:
            self.conn.execute(f'DESCRIBE "{object_type}"')
            table_exists = True
        except duckdb.CatalogException:
            table_exists = False
            
        if not table_exists:
            # Create new table
            col_defs = [f'"{k}" {v}' for k, v in desired_columns.items()]
            create_sql = f'CREATE TABLE "{object_type}" ({", ".join(col_defs)}, PRIMARY KEY (id))'
            print(f"Creating Table: {create_sql}")
            self.conn.execute(create_sql)
        else:
            # Alter existing table
            existing_cols_df = self.conn.execute(f'DESCRIBE "{object_type}"').df()
            existing_cols = set(existing_cols_df['column_name'].tolist())
            
            for col_name, col_type in desired_columns.items():
                if col_name not in existing_cols:
                    alter_sql = f'ALTER TABLE "{object_type}" ADD COLUMN "{col_name}" {col_type}'
                    print(f"Altering Table: {alter_sql}")
                    try:
                        self.conn.execute(alter_sql)
                    except Exception as e:
                        print(f"Failed to add column {col_name}: {e}")

    def insert_object(self, object_type: str, obj_data: Dict[str, Any]):
        """
        Inserts or updates an object instance.
        """
        # 1. Get table schema to ensure we only insert valid columns
        try:
            schema_df = self.conn.execute(f'DESCRIBE "{object_type}"').df()
            valid_columns = set(schema_df['column_name'].tolist())
        except duckdb.CatalogException:
            print(f"Table {object_type} does not exist. Skipping insert.")
            return

        # 2. Filter data to match valid columns
        filtered_data = {k: v for k, v in obj_data.items() if k in valid_columns}
        
        if not filtered_data:
            return

        # 3. Prepare columns and values
        keys = list(filtered_data.keys())
        escaped_keys = [f'"{k}"' for k in keys]
        placeholders = ["?"] * len(keys)
        values = list(filtered_data.values())
        
        # DuckDB's INSERT OR REPLACE
        sql = f'INSERT OR REPLACE INTO "{object_type}" ({", ".join(escaped_keys)}) VALUES ({", ".join(placeholders)})'
        
        try:
            self.conn.execute(sql, values)
        except Exception as e:
            print(f"Insert failed for {object_type}: {e}")

    def query_objects(self, object_type: str, filters: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Query objects with SQL.
        """
        try:
            sql = f'SELECT * FROM "{object_type}"'
            if filters:
                sql += f" WHERE {filters}"
            sql += f" LIMIT {limit}"
            
            df = self.conn.execute(sql).df()
            # Convert NaN to None for JSON compatibility
            return df.where(pd.notnull(df), None).to_dict(orient="records")
        except duckdb.CatalogException:
            return []
        except Exception as e:
            print(f"Query failed: {e}")
            return []

    def raw_query(self, sql: str) -> List[Dict[str, Any]]:
        """
        Execute raw SQL for advanced analytics.
        """
        try:
            # Safety check: prevent dropping tables? (Maybe too restrictive for now)
            df = self.conn.execute(sql).df()
            return df.where(pd.notnull(df), None).to_dict(orient="records")
        except Exception as e:
            raise e

# Global instance
duck_db = DuckDBClient()
