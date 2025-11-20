import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import json
import random
import uuid
from datetime import datetime, timedelta
import time

API_URL = "http://127.0.0.1:8000"

session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
session.mount('http://', HTTPAdapter(max_retries=retries))

def create_type(api_name, display_name, description, properties):
    print(f"Creating Object Type: {display_name}...")
    try:
        session.post(f"{API_URL}/ontology/types", json={
            "api_name": api_name,
            "display_name": display_name,
            "description": description,
            "property_definitions": properties
        }, timeout=10)
    except Exception as e:
        print(f"Error creating {display_name}: {e}")

def create_object(object_type_id, title, properties):
    try:
        session.post(f"{API_URL}/objects", json={
            "object_type_id": object_type_id,
            "title": title,
            "properties": properties
        }, timeout=10)
    except Exception as e:
        print(f"Error creating object {title}: {e}")

def seed():
    print("--- Seeding Supply Chain Ontology ---")
    
    # Wait for API to be ready
    print("Waiting for API...")
    for i in range(10):
        try:
            session.get(f"{API_URL}/", timeout=2)
            print("API is ready!")
            break
        except:
            print(f"Waiting... {i}")
            time.sleep(2)


    # 1. Define Ontology
    create_type("port", "Port", "Global shipping ports", [
        {"name": "location", "type": "string", "title": "Location"},
        {"name": "country", "type": "string", "title": "Country"},
        {"name": "capacity", "type": "integer", "title": "Capacity (TEU)"},
        {"name": "status", "type": "string", "title": "Operational Status"},
        {"name": "coordinates", "type": "string", "title": "Coordinates"}
    ])

    create_type("vessel", "Vessel", "Container ships", [
        {"name": "imo", "type": "string", "title": "IMO Number"},
        {"name": "flag", "type": "string", "title": "Flag State"},
        {"name": "capacity", "type": "integer", "title": "Capacity (TEU)"},
        {"name": "current_location", "type": "string", "title": "Current Location"},
        {"name": "destination", "type": "string", "title": "Destination Port"}
    ])

    create_type("shipment", "Shipment", "Cargo shipments", [
        {"name": "contents", "type": "string", "title": "Contents"},
        {"name": "value", "type": "float", "title": "Value ($)"},
        {"name": "priority", "type": "string", "title": "Priority"},
        {"name": "vessel_id", "type": "string", "title": "Vessel ID"},
        {"name": "origin", "type": "string", "title": "Origin Port"},
        {"name": "destination", "type": "string", "title": "Destination Port"},
        {"name": "status", "type": "string", "title": "Status"}
    ])

    create_type("disruption", "Disruption", "Supply chain disruptions", [
        {"name": "type", "type": "string", "title": "Type"},
        {"name": "severity", "type": "string", "title": "Severity"},
        {"name": "location", "type": "string", "title": "Affected Location"},
        {"name": "description", "type": "string", "title": "Description"},
        {"name": "estimated_impact", "type": "float", "title": "Est. Impact ($)"}
    ])

    # Get IDs (assuming API returns them or we can fetch them)
    # For simplicity in this script, we'll fetch all types to map names to IDs
    types = session.get(f"{API_URL}/ontology/types").json()
    type_map = {t['api_name']: t['id'] for t in types}

    # 2. Create Data
    
    # Ports
    ports = [
        {"title": "Port of Rotterdam", "country": "Netherlands", "loc": "51.9225, 4.47917", "cap": 14500000},
        {"title": "Port of Singapore", "country": "Singapore", "loc": "1.3521, 103.8198", "cap": 37200000},
        {"title": "Port of Los Angeles", "country": "USA", "loc": "33.7288, -118.2620", "cap": 10700000},
        {"title": "Port of Shanghai", "country": "China", "loc": "31.2304, 121.4737", "cap": 43500000},
        {"title": "Port of Hamburg", "country": "Germany", "loc": "53.5488, 9.9872", "cap": 8700000}
    ]
    
    for p in ports:
        create_object(type_map['port'], p['title'], {
            "location": p['title'],
            "country": p['country'],
            "capacity": p['cap'],
            "status": "Operational",
            "coordinates": p['loc']
        })

    # Vessels
    vessels = [
        {"title": "Ever Given", "imo": "9811000", "dest": "Port of Rotterdam"},
        {"title": "Maersk Madrid", "imo": "9778791", "dest": "Port of Los Angeles"},
        {"title": "CMA CGM Marco Polo", "imo": "9454436", "dest": "Port of Singapore"},
        {"title": "MSC Gulsun", "imo": "9839430", "dest": "Port of Hamburg"},
        {"title": "HMM Algeciras", "imo": "9863297", "dest": "Port of Shanghai"}
    ]

    for v in vessels:
        create_object(type_map['vessel'], v['title'], {
            "imo": v['imo'],
            "flag": "Panama",
            "capacity": 20000 + random.randint(0, 4000),
            "current_location": "At Sea",
            "destination": v['dest']
        })

    # Shipments
    contents = ["Semiconductors", "Automotive Parts", "Medical Supplies", "Consumer Electronics", "Textiles"]
    priorities = ["High", "Critical", "Medium", "Low"]
    
    print("Generating 50 shipments...")
    for i in range(50):
        vessel = random.choice(vessels)
        origin = random.choice(ports)
        dest = next(p for p in ports if p['title'] == vessel['dest']) # Shipments match vessel dest
        
        content = random.choice(contents)
        value = random.randint(50000, 5000000)
        priority = "Critical" if value > 1000000 else random.choice(priorities)
        
        create_object(type_map['shipment'], f"SHP-{1000+i}", {
            "contents": content,
            "value": value,
            "priority": priority,
            "vessel_id": vessel['title'], # Linking by name for simplicity in demo
            "origin": origin['title'],
            "destination": dest['title'],
            "status": "In Transit"
        })

    # Disruptions
    create_object(type_map['disruption'], "Typhoon In-fa", {
        "type": "Weather",
        "severity": "High",
        "location": "East China Sea",
        "description": "Severe typhoon impacting shipping routes to Shanghai",
        "estimated_impact": 150000000.0
    })
    
    create_object(type_map['disruption'], "Labor Strike - LA", {
        "type": "Labor",
        "severity": "Medium",
        "location": "Port of Los Angeles",
        "description": "Dockworkers union strike causing delays",
        "estimated_impact": 50000000.0
    })

    print("--- Seeding Complete ---")

if __name__ == "__main__":
    seed()
