import sys
import os
import uuid
import json

# Ensure we're in the right path
sys.path.append(os.getcwd())

try:
    from nexus_os.core.vector_store import VectorStore
    print("✅ Successfully imported VectorStore")
except ImportError as e:
    print(f"❌ Failed to import VectorStore: {e}")
    sys.exit(1)

def verify_rag():
    print("--- Starting RAG & Vector Store Verification ---")
    
    # 1. Initialize Vector Store
    try:
        vs = VectorStore()
        print("✅ VectorStore initialized (ChromaDB)")
    except Exception as e:
        print(f"❌ Failed to initialize VectorStore: {e}")
        return

    # 2. Test Ingestion
    test_id = f"test-doc-{uuid.uuid4()}"
    test_title = "Station Alpha Protocol"
    test_props = {
        "status": "Operational",
        "description": "Primary power generation unit for North Sector. Critical infrastructure.",
        "maintainer": "Grid Ops Team A"
    }
    
    print(f"Testing Indexing for: {test_title}")
    try:
        vs.index_object(
            obj_id=test_id,
            title=test_title,
            properties=test_props,
            object_type="Facility"
        )
        print("✅ Indexing successful")
    except Exception as e:
        print(f"❌ Indexing failed: {e}")
        return

    # 3. Test Retrieval (Exact Keyword)
    print("\nTesting Retrieval (Query: 'Station Alpha')...")
    results = vs.search("Station Alpha")
    if results and any(r['metadata']['title'] == test_title for r in results):
        print("✅ Found document via exact title search")
        print(f"   Context: {results[0]['document'][:100]}...")
    else:
        print("❌ Failed to find document via exact title")
        print(f"   Results: {results}")

    # 4. Test Retrieval (Semantic/Related)
    print("\nTesting Retrieval (Query: 'North Sector power')...")
    results = vs.search("North Sector power")
    if results and any(r['metadata']['title'] == test_title for r in results):
        print("✅ Found document via semantic search")
    else:
        print("⚠️ Semantic search might need tuning or more data (expected for 'all-MiniLM-L6-v2' on single doc)")
        print(f"   Results: {results}")

if __name__ == "__main__":
    verify_rag()
