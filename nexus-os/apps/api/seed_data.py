import requests
import json

API_URL = "http://localhost:8000"

def seed():
    print("Seeding Nexus OS...")
    
    # 1. Create Object Types
    print("Creating Object Types...")
    
    aircraft_type = {
        "api_name": "aircraft",
        "display_name": "Aircraft",
        "description": "Commercial and military aircraft",
        "icon": "plane",
        "color": "#3B82F6",
        "property_definitions": [
            {"name": "tail_number", "type": "string", "title": "Tail Number"},
            {"name": "model", "type": "string", "title": "Model"},
            {"name": "status", "type": "string", "title": "Status"},
            {"name": "last_maintenance", "type": "date", "title": "Last Maintenance"}
        ]
    }
    
    incident_type = {
        "api_name": "incident",
        "display_name": "Maintenance Incident",
        "description": "Reported issues and maintenance events",
        "icon": "alert-triangle",
        "color": "#EF4444",
        "property_definitions": [
            {"name": "incident_id", "type": "string", "title": "Incident ID"},
            {"name": "severity", "type": "string", "title": "Severity"},
            {"name": "description", "type": "string", "title": "Description"},
            {"name": "date", "type": "date", "title": "Date"}
        ]
    }
    
    # Check if exists first (simple check)
    try:
        r_aircraft = requests.post(f"{API_URL}/ontology/types", json=aircraft_type)
        aircraft_type_id = r_aircraft.json()["id"]
        print(f"Created Aircraft Type: {aircraft_type_id}")
    except:
        print("Aircraft type might already exist or error.")
        # Fetch it
        types = requests.get(f"{API_URL}/ontology/types").json()
        aircraft_type_id = next((t["id"] for t in types if t["api_name"] == "aircraft"), None)

    try:
        r_incident = requests.post(f"{API_URL}/ontology/types", json=incident_type)
        incident_type_id = r_incident.json()["id"]
        print(f"Created Incident Type: {incident_type_id}")
    except:
        print("Incident type might already exist.")
        types = requests.get(f"{API_URL}/ontology/types").json()
        incident_type_id = next((t["id"] for t in types if t["api_name"] == "incident"), None)

    # 2. Create Link Types
    print("Creating Link Types...")
    link_type = {
        "api_name": "aircraft_has_incident",
        "display_name": "Has Incident",
        "source_object_type_id": aircraft_type_id,
        "target_object_type_id": incident_type_id,
        "cardinality": "ONE_TO_MANY"
    }
    
    try:
        r_link = requests.post(f"{API_URL}/ontology/link-types", json=link_type)
        link_type_id = r_link.json()["id"]
        print(f"Created Link Type: {link_type_id}")
    except:
        print("Link type might already exist.")
        links = requests.get(f"{API_URL}/ontology/link-types").json()
        link_type_id = next((l["id"] for l in links if l["api_name"] == "aircraft_has_incident"), None)

    # 3. Create Objects
    print("Creating Objects...")
    
    # Aircraft 1
    ac1 = {
        "object_type_id": aircraft_type_id,
        "title": "N12345 (Boeing 737)",
        "properties": {
            "tail_number": "N12345",
            "model": "Boeing 737-800",
            "status": "Active",
            "last_maintenance": "2023-10-15"
        }
    }
    r_ac1 = requests.post(f"{API_URL}/objects", json=ac1)
    ac1_id = r_ac1.json()["id"]
    
    # Aircraft 2
    ac2 = {
        "object_type_id": aircraft_type_id,
        "title": "N98765 (Airbus A320)",
        "properties": {
            "tail_number": "N98765",
            "model": "Airbus A320",
            "status": "Maintenance",
            "last_maintenance": "2023-11-01"
        }
    }
    r_ac2 = requests.post(f"{API_URL}/objects", json=ac2)
    ac2_id = r_ac2.json()["id"]
    
    # Incident 1
    inc1 = {
        "object_type_id": incident_type_id,
        "title": "INC-2023-001 (Engine Vibration)",
        "properties": {
            "incident_id": "INC-2023-001",
            "severity": "High",
            "description": "Excessive vibration reported in engine #2 during climb.",
            "date": "2023-11-01"
        }
    }
    r_inc1 = requests.post(f"{API_URL}/objects", json=inc1)
    inc1_id = r_inc1.json()["id"]
    
    # 4. Create Links
    print("Linking Objects...")
    link = {
        "link_type_id": link_type_id,
        "source_object_id": ac2_id,
        "target_object_id": inc1_id
    }
    requests.post(f"{API_URL}/links", json=link)
    
    print("Seeding Complete!")

if __name__ == "__main__":
    seed()
