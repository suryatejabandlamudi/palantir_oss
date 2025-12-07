from nexus_os.core.duckdb_client import duck_db
from nexus_os.apps.api.pipeline_engine import pipeline_engine

def query_ontology(query: str = None):
    """
    Get information about available Object Types (tables) and their schemas.
    If query is provided, searches for specific types.
    """
    try:
        # Get all tables
        tables_df = duck_db.conn.execute("SHOW TABLES").df()
        tables = tables_df['name'].tolist()
        
        schemas = {}
        for t in tables:
            # Get schema for each table
            schema_df = duck_db.conn.execute(f"DESCRIBE \"{t}\"").df()
            columns = schema_df[['column_name', 'column_type']].to_dict(orient="records")
            schemas[t] = columns
            
        return json.dumps(schemas, indent=2)
    except Exception as e:
        return f"Error querying ontology: {e}"

def run_sql_query(sql: str):
    """Execute a SQL query against the DuckDB analytical engine."""
    try:
        return duck_db.raw_query(sql)
    except Exception as e:
        return f"SQL Error: {e}"

def run_pipeline(pipeline_id: str):
    """
    Trigger a data pipeline by ID. 
    (For MVP, we might just run a named pipeline or SQL).
    """
    # For now, we don't have easy access to Pipeline IDs in this scope without DB session.
    # We'll assume the LLM passes a SQL query as a pipeline for now, or we mock it.
    return {"status": "mock_triggered", "pipeline_id": pipeline_id}

def create_alert(severity: str, title: str, message: str):
    """
    Create a visible alert/notification for the user.
    Severity: 'info', 'warning', 'critical'.
    """
    return {
        "alert": {
            "severity": severity,
            "title": title,
            "message": message
        }
    }

def analyze_impact(disruption_name: str):
    """
    Analyze the impact of a specific disruption on shipments.
    Returns a structured analysis including total value at risk and affected shipments.
    """
    try:
        # 1. Find the disruption
        disruption_sql = f"SELECT * FROM Disruption WHERE title = '{disruption_name}'"
        disruptions = duck_db.raw_query(disruption_sql)
        
        if not disruptions:
            return {"error": f"Disruption '{disruption_name}' not found."}
        
        disruption = disruptions[0]
        location = disruption.get('location')
        
        # 2. Find affected shipments (Origin or Destination matches location)
        # Note: In a real app, we'd do geospatial intersection. Here we match string location.
        shipments_sql = f"""
            SELECT * FROM Shipment 
            WHERE origin = '{location}' OR destination = '{location}'
        """
        affected_shipments = duck_db.raw_query(shipments_sql)
        
        # 3. Calculate Impact
        total_value = sum(s.get('value', 0) for s in affected_shipments)
        critical_count = sum(1 for s in affected_shipments if s.get('priority') == 'Critical')
        
        return {
            "disruption": disruption,
            "impact_summary": {
                "total_value_at_risk": total_value,
                "affected_shipment_count": len(affected_shipments),
                "critical_shipments": critical_count
            },
            "affected_shipments": affected_shipments[:10] # Return top 10
        }
        
    except Exception as e:
        return {"error": str(e)}

AVAILABLE_TOOLS = {
    "query_ontology": query_ontology,
    "run_sql_query": run_sql_query,
    "create_alert": create_alert,
    "analyze_impact": analyze_impact
}
