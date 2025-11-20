import sys
import os
import pandas as pd
from duckdb_client import duck_db
from pipeline_engine import pipeline_engine

# Setup
print("--- Testing Foundry Backend ---")

# 1. Test Schema Evolution
print("\n1. Testing Schema Evolution...")
obj_type = "test_aircraft"
props_v1 = {"tail_number": {"type": "string"}, "speed": {"type": "integer"}}
duck_db.create_object_table(obj_type, props_v1)

# Insert v1
duck_db.insert_object(obj_type, {"id": "1", "title": "Plane 1", "tail_number": "N1", "speed": 500})
print("Inserted v1 object.")

# Evolve Schema
props_v2 = {"tail_number": {"type": "string"}, "speed": {"type": "integer"}, "altitude": {"type": "integer"}}
duck_db.create_object_table(obj_type, props_v2) # Should ALTER TABLE

# Insert v2
duck_db.insert_object(obj_type, {"id": "2", "title": "Plane 2", "tail_number": "N2", "speed": 600, "altitude": 30000})
print("Inserted v2 object.")

# Verify
results = duck_db.query_objects(obj_type)
print(f"Query Results ({len(results)}):")
for r in results:
    print(r)

assert len(results) == 2
assert "altitude" in results[0] # Should be None for id=1

# 2. Test SQL Pipeline
print("\n2. Testing SQL Pipeline...")
sql_code = f"SELECT * FROM \"{obj_type}\" WHERE speed > 550"
output_type = "fast_aircraft"

res = pipeline_engine.execute_pipeline(sql_code, [obj_type], output_type)
print("Pipeline Result:", res)

assert res["status"] == "COMPLETED"
assert res["rows_written"] == 1

# Verify Output
out_results = duck_db.query_objects(output_type)
print(f"Output Results ({len(out_results)}):")
for r in out_results:
    print(r)
assert out_results[0]["id"] == "2"

# 3. Test Python Pipeline
print("\n3. Testing Python Pipeline...")
py_code = """
def transform(inputs, conn):
    df = inputs["fast_aircraft"]
    df["status"] = "SUPERSONIC"
    return df
"""
output_type_py = "supersonic_aircraft"
res_py = pipeline_engine.execute_pipeline(py_code, ["fast_aircraft"], output_type_py)
print("Python Pipeline Result:", res_py)

assert res_py["status"] == "COMPLETED"
assert res_py["rows_written"] == 1

# Verify Output
py_results = duck_db.query_objects(output_type_py)
print(f"Python Output Results ({len(py_results)}):")
for r in py_results:
    print(r)
assert py_results[0]["status"] == "SUPERSONIC"

# 4. Test Pipeline Preview Endpoint (Mocking API call logic)
print("\n4. Testing Pipeline Preview Logic...")
# We test the engine directly as if called by the endpoint
preview_code = "SELECT * FROM \"test_aircraft\""
preview_res = pipeline_engine.execute_pipeline(preview_code, ["test_aircraft"], "PreviewOutput")
print("Preview Result:", preview_res)

assert preview_res["status"] == "COMPLETED"
assert preview_res["rows_written"] == 2

# Verify Preview Output Table
preview_rows = duck_db.query_objects("PreviewOutput")
print(f"Preview Rows ({len(preview_rows)}):")
for r in preview_rows:
    print(r)
assert len(preview_rows) == 2

print("\n--- ALL TESTS PASSED ---")
