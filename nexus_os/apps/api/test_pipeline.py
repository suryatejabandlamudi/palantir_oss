#!/usr/bin/env python3
"""Direct test of Pipeline Engine"""

import sys
sys.path.insert(0, '/Users/suryatejabandlamudi/palantir_oss/nexus-os/apps/api')

from pipeline_engine import pipeline_engine
from duckdb_client import duck_db
import pandas as pd

# Setup test data
print("Setting up test data...")
duck_db.conn.execute('DROP TABLE IF EXISTS TestSensor')
duck_db.conn.execute('CREATE TABLE TestSensor (id VARCHAR, title VARCHAR, status VARCHAR, value DOUBLE)')
duck_db.conn.execute("INSERT INTO TestSensor VALUES ('1', 'Sensor-001', 'active', 98.6)")
duck_db.conn.execute("INSERT INTO TestSensor VALUES ('2', 'Sensor-002', 'active', 45.2)")
duck_db.conn.execute("INSERT INTO TestSensor VALUES ('3', 'Sensor-003', 'active', 102.5)")

# Pipeline code
code = """
def transform(inputs, conn):
    df = inputs['TestSensor']
    print(f"Input rows: {len(df)}")
    filtered = df[df['value'] > 90]
    print(f"Output rows: {len(filtered)}")
    return filtered
"""

print("\nExecuting pipeline...")
result = pipeline_engine.execute_pipeline(
    code=code,
    input_types=['TestSensor'],
    output_type='ProcessedTestSensor'
)

print(f"\nPipeline Status: {result['status']}")
print(f"Logs:\n{result['logs']}")

# Verify output
print("\nQuerying output table...")
output = duck_db.conn.execute('SELECT * FROM ProcessedTestSensor').df()
print(output)
print(f"\nSuccess! Processed {len(output)} rows.")
