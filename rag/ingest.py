from rag.store import VectorStore
from agent.tools import ToolRegistry

def ingest_knowledge_base():
    """
    Fetches data from configured connectors and ingests into Vector Store.
    """
    print("Starting ingestion pipeline...")
    store = VectorStore()
    registry = ToolRegistry()
    
    documents = []
    metadatas = []
    ids = []

    # 1. Ingest from Knowledge Connector (Confluence/Jira)
    # We'll use the 'search' tools to fetch recent items as a demo of ingestion.
    # In production, this would be a full crawl or webhook-based.
    
    try:
        # Fetch recent Jira issues
        print("Fetching Jira issues...")
        jira_issues = registry.execute_tool("knowledge_search_jira", jql="order by created DESC")
        if isinstance(jira_issues, list):
            for issue in jira_issues:
                text = f"Jira Issue {issue['key']}: {issue['summary']}. Status: {issue['status']}. Priority: {issue['priority']}."
                documents.append(text)
                metadatas.append({"source": "jira", "id": issue["id"], "key": issue["key"]})
                ids.append(f"jira-{issue['id']}")
    except Exception as e:
        print(f"Skipping Jira ingestion: {e}")

    try:
        # Fetch Confluence pages (searching for common terms to get a sample)
        print("Fetching Confluence pages...")
        pages = registry.execute_tool("knowledge_search_confluence", query="project")
        if isinstance(pages, list):
            for page in pages:
                text = f"Confluence Page: {page['title']}. URL: {page['url']}"
                documents.append(text)
                metadatas.append({"source": "confluence", "id": page["id"], "url": page["url"]})
                ids.append(f"confluence-{page['id']}")
    except Exception as e:
        print(f"Skipping Confluence ingestion: {e}")

    # 2. Ingest from Comms (Slack/Teams) - Optional/Advanced
    # Skipping for now to keep it simple, but logic is identical.

    if documents:
        print(f"Ingesting {len(documents)} items into Vector Store...")
        store.add_documents(documents, metadatas, ids)
        print("Ingestion complete.")
    else:
        print("No documents found to ingest.")

if __name__ == "__main__":
    ingest_knowledge_base()
