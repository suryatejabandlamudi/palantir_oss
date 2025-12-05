try:
    import chromadb
except ImportError:
    chromadb = None

import uuid
from typing import List, Dict, Any, Optional
from agent.llm import GeminiClient

class VectorStore:
    def __init__(self, collection_name: str = "palantir_knowledge"):
        if not chromadb:
            print("WARNING: chromadb not installed. VectorStore will not function.")
            self.client = None
            self.collection = None
            self.llm_client = None
            return

        # Persistent client
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(name=collection_name)
        
        # Embedding function (using our GeminiClient)
        try:
            self.llm_client = GeminiClient()
        except ValueError:
            print("WARNING: Gemini API Key not found. VectorStore will fail to embed.")
            self.llm_client = None

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]] = None, ids: List[str] = None):
        """
        Embeds and adds documents to the store.
        """
        if not self.llm_client:
            raise ValueError("Cannot add documents without Gemini API Key for embeddings.")

        if not ids:
            ids = [str(uuid.uuid4()) for _ in range(len(documents))]
            
        if not metadatas:
            metadatas = [{} for _ in range(len(documents))]

        # Batch embedding (Gemini API has limits, so we do one by one or small batches)
        # For simplicity, we loop. In production, use batch API if available or parallelize.
        embeddings = []
        for doc in documents:
            emb = self.llm_client.embed_content(doc)
            embeddings.append(emb)

        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"Added {len(documents)} documents to vector store.")

    def query(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Semantically searches the store.
        """
        if not self.llm_client:
             raise ValueError("Cannot query without Gemini API Key for embeddings.")

        query_embedding = self.llm_client.embed_content(query_text)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Flatten results
        flattened = []
        if results["documents"]:
            for i in range(len(results["documents"][0])):
                flattened.append({
                    "id": results["ids"][0][i],
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else None
                })
        
        return flattened
