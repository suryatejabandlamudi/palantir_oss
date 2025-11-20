import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any
import uuid

class VectorStore:
    def __init__(self):
        self.client = chromadb.Client()
        self.collection = self.client.create_collection(
            name="nexus_ontology",
            embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
        )

    def index_object(self, obj_id: str, title: str, properties: Dict[str, Any], object_type: str):
        # Create a text representation of the object for embedding
        text_content = f"{object_type}: {title}. "
        for k, v in properties.items():
            text_content += f"{k}: {v}. "
        
        self.collection.upsert(
            ids=[obj_id],
            documents=[text_content],
            metadatas=[{"object_type": object_type, "title": title, **{k: str(v) for k, v in properties.items()}}]
        )

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        results = self.collection.query(
            query_texts=[query],
            n_results=limit
        )
        
        formatted_results = []
        if results['ids']:
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "document": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i]
                })
        return formatted_results

# Global instance
vector_store = VectorStore()
