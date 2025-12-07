import duckdb
import pandas as pd
import io
import sys
from typing import Any, Dict
from nexus_os.core.duckdb_client import duck_db

class PipelineEngine:
    def execute_pipeline(self, code: str, input_types: list[str], output_type: str) -> Dict[str, Any]:
        """
        Executes user-defined code (Python or SQL) to transform data.
        
        If code contains 'def transform', it's treated as Python.
        Otherwise, it's treated as SQL.
        """
        
        if "def transform" in code:
            return self._execute_python(code, input_types, output_type)
        else:
            return self._execute_sql(code, input_types, output_type)

    def _execute_sql(self, sql: str, input_types: list[str], output_type: str) -> Dict[str, Any]:
        try:
            # 1. Execute SQL
            # We assume the SQL is a SELECT statement or a series of statements ending in a SELECT
            # Or it could be a CREATE TABLE AS...
            
            # For safety/simplicity, we wrap it in a CREATE OR REPLACE TABLE
            # But the user might have written "SELECT * FROM ..."
            
            # Heuristic: If it starts with SELECT or WITH, wrap it.
            clean_sql = sql.strip().upper()
            if clean_sql.startswith("SELECT") or clean_sql.startswith("WITH"):
                final_sql = f'CREATE OR REPLACE TABLE "{output_type}" AS {sql}'
            else:
                # Assume user wrote full DDL or complex logic
                final_sql = sql
                
            duck_db.conn.execute(final_sql)
            
            # Get row count
            count_df = duck_db.conn.execute(f'SELECT COUNT(*) as c FROM "{output_type}"').df()
            rows_written = int(count_df.iloc[0]['c'])
            
            return {"status": "COMPLETED", "logs": "SQL executed successfully.", "rows_written": rows_written}
            
        except Exception as e:
            return {"status": "FAILED", "logs": f"SQL Error: {str(e)}"}

    def _execute_python(self, code: str, input_types: list[str], output_type: str) -> Dict[str, Any]:
        """
        Executes user-defined Python code.
        """
        
        # 1. Prepare Inputs
        inputs = {}
        for obj_type in input_types:
            # Fetch data as DataFrame
            try:
                df = duck_db.conn.execute(f'SELECT * FROM "{obj_type}"').df()
                inputs[obj_type] = df
            except Exception:
                inputs[obj_type] = pd.DataFrame() # Empty if table doesn't exist

        # 2. Prepare Execution Environment
        local_scope = {}
        global_scope = {
            "pd": pd,
            "duckdb": duckdb,
            "inputs": inputs,
            "conn": duck_db.conn
        }
        
        # 3. Execute Code
        # Capture stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        
        try:
            exec(code, global_scope, local_scope)
            
            # Check for transform function
            if "transform" not in local_scope:
                raise ValueError("Pipeline code must define a 'transform(inputs, conn)' function.")
            
            transform_func = local_scope["transform"]
            result_df = transform_func(inputs, duck_db.conn)
            
            if not isinstance(result_df, pd.DataFrame):
                raise ValueError("Transform function must return a pandas DataFrame.")
                
            # 4. Write Output
            # We use DuckDB's register feature to treat the DF as a table, then INSERT
            duck_db.conn.register("temp_pipeline_result", result_df)
            
            # Ensure output table exists (basic schema inference if needed, or assume pre-existing)
            # For this MVP, we'll assume the output table matches the DF columns or we create it
            duck_db.conn.execute(f'CREATE TABLE IF NOT EXISTS "{output_type}" AS SELECT * FROM temp_pipeline_result WHERE 1=0')
            
            # Insert
            duck_db.conn.execute(f'INSERT INTO "{output_type}" SELECT * FROM temp_pipeline_result')
            
            duck_db.conn.unregister("temp_pipeline_result")
            
            logs = redirected_output.getvalue()
            return {"status": "COMPLETED", "logs": logs, "rows_written": len(result_df)}
            
        except Exception as e:
            logs = redirected_output.getvalue()
            return {"status": "FAILED", "logs": logs + f"\nError: {str(e)}"}
            
        finally:
            sys.stdout = old_stdout

# Global instance
pipeline_engine = PipelineEngine()
