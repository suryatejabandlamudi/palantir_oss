# Nexus OS Architecture

## System Overview

Nexus OS follows a modern, modular architecture designed for scalability and extensibility. It is composed of a high-performance Python backend and a responsive React-based frontend.

### 1. Backend (`apps/api`)

The backend is built with **FastAPI**, providing a robust and high-speed REST API.

*   **Database Layer**:
    *   **Metadata**: SQLite (via SQLAlchemy) stores configuration, user data, and Ontology definitions.
    *   **Analytical Data**: **DuckDB** is used as the high-performance in-process OLAP engine for storing and querying massive amounts of object data. It supports schema evolution and complex SQL queries.
*   **Async Task Queue**: **Celery** (with Redis) handles long-running background tasks such as:
    *   Pipeline execution (Python/SQL).
    *   Deployment orchestration (Apollo).
    *   Simulation loops (Gotham).
*   **AI Integration**:
    *   **Ollama**: Connects to a local LLM instance for privacy-first AI.
    *   **RAG & Tools**: Implements a custom tool-calling loop that allows the LLM to interact with the Ontology and external systems.

### 2. Frontend (`apps/web`)

The frontend is a Single Page Application (SPA) built with **Next.js**.

*   **UI Component System**: Custom `@nexus/ui` library based on Tailwind CSS for a consistent, "Palantir-like" dense and professional aesthetic.
*   **Visualization**:
    *   **Deck.GL / MapLibre**: High-performance geospatial rendering for Gotham.
    *   **ReactFlow**: Node-based editors for Pipeline Builder.
*   **State Management**: React Hooks and Context API for managing workspace state and live updates.

### 3. Data Flow

1.  **Ingestion**: Data enters via CSV upload or API -> Processed by `PipelineEngine` -> Stored in `DuckDB`.
2.  **Ontology**: `ObjectType` definitions in SQLite map to tables in `DuckDB`.
3.  **Consumption**:
    *   **Foundry**: Direct SQL queries to DuckDB.
    *   **AIP**: LLM generates SQL queries -> Executed against DuckDB -> Results returned as JSON.
    *   **Gotham**: Geospatial queries fetch lat/lon data -> Rendered on Map.

## Directory Structure

```
nexus-os/
├── apps/
│   ├── api/                 # Python FastAPI Backend
│   │   ├── main.py          # Entry point & Endpoints
│   │   ├── models.py        # SQLAlchemy ORM Models
│   │   ├── duckdb_client.py # Wrapper for DuckDB operations
│   │   ├── aip_tools.py     # AI Tool definitions
│   │   └── tasks.py         # Celery tasks
│   └── web/                 # Next.js Frontend
│       ├── src/app/         # App Router pages (Foundry, AIP, Gotham, Apollo)
│       ├── src/components/  # Reusable UI components
│       └── src/lib/         # API clients and utilities
```
