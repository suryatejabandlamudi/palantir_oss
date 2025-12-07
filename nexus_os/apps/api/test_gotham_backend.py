import sys
import os
import json
from unittest.mock import MagicMock, patch
from duckdb_client import duck_db
from main import create_mission, list_missions, simulate_live_updates, get_db
from models import Mission

# Setup
print("--- Testing Gotham Backend ---")

# Mock DB Session
class MockSession:
    def __init__(self):
        self.store = []
    def add(self, obj):
        self.store.append(obj)
    def commit(self):
        pass
    def refresh(self, obj):
        pass
    def query(self, model):
        return self
    def all(self):
        return self.store

mock_db = MockSession()

# 1. Test Create Mission
print("\n1. Testing Create Mission...")
mission_data = {
    "title": "Test Mission",
    "status": "DRAFT",
    "layers": [{"type": "Feature", "geometry": {"type": "Point", "coordinates": [0, 0]}}]
}
new_mission = create_mission(mission_data, mock_db)
print("Created Mission:", new_mission.title)
assert new_mission.title == "Test Mission"
assert len(mock_db.store) == 1

# 2. Test List Missions
print("\n2. Testing List Missions...")
missions = list_missions(mock_db)
print(f"Found {len(missions)} missions.")
assert len(missions) == 1

# 3. Test Live Simulation
print("\n3. Testing Live Simulation...")
# Ensure we have a vessel
duck_db.conn.execute("DROP TABLE IF EXISTS Vessel")
duck_db.conn.execute("CREATE TABLE IF NOT EXISTS Vessel (id VARCHAR PRIMARY KEY, title VARCHAR, latitude DOUBLE, longitude DOUBLE)")
duck_db.conn.execute("INSERT INTO Vessel VALUES ('v1', 'Vessel 1', 1.0, 103.0)")

res = simulate_live_updates()
print("Simulation Result:", res)
assert res["status"] == "UPDATED"
assert res["objects_moved"] > 0

# Verify movement
vessels = duck_db.query_objects("Vessel")
print("Updated Vessel:", vessels[0])
assert vessels[0]["latitude"] != 1.0 # Should have moved

print("\n--- ALL TESTS PASSED ---")
