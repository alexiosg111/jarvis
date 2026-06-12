"""
Memory Engine - Qdrant vector store for Jarvis HUD semantic memory.

Uses LangChain's Qdrant integration with HuggingFace embeddings
for storing and retrieving conversational facts and context.
"""
import os
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient


class MemoryEngine:
    """
    Semantic memory backend using Qdrant vector database.

    Stores conversation facts and retrieves relevant context
    for the LangGraph orchestrator.
    """

    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.client = QdrantClient(url=qdrant_url)
        collection_name = "jarvis_memory"

        # Ensure collection exists
        try:
            self.client.get_collection(collection_name)
        except Exception:
            self.client.recreate_collection(
                collection_name=collection_name,
                vectors_config={"size": 384, "distance": "Cosine"},
            )

        self.vector_store = Qdrant(
            client=self.client,
            collection_name=collection_name,
            embeddings=self.embeddings,
        )

    def retrieve_context(self, query, limit=3):
        """
        Retrieve semantically similar context from memory.

        Parameters:
            query (str): Search query.
            limit (int): Number of results to return.

        Returns:
            str: Concatenated relevant memory passages.
        """
        try:
            docs = self.vector_store.similarity_search(query, k=limit)
            return "\n".join([doc.page_content for doc in docs])
        except Exception:
            return ""

    def store_memory(self, fact):
        """
        Store a fact or conversation segment in vector memory.

        Parameters:
            fact (str): Text content to remember.
        """
        try:
            self.vector_store.add_texts([fact])
        except Exception:
            pass  # Silently handle if Qdrant is unavailable