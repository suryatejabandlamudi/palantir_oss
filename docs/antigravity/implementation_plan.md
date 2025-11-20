# Palantir Ecosystem Replica - Implementation Plan

## Goal Description
The goal is to build a high-fidelity replica of the Palantir ecosystem, integrated into a unified "Nexus OS". This includes:
1.  **Foundry**: Data integration, Ontology management, and operational applications.
2.  **Gotham**: Geospatial intelligence, graph analysis, and mission planning.
3.  **Apollo**: Continuous delivery and infrastructure management.
4.  **AIP**: AI integration, "Chat with Data", and agentic workflows.

The system will be built as a monorepo (`nexus-os`) with a shared design system, a unified backend API, and distinct frontend applications for each product, all connected via a shared "Ontology" layer.

## User Review Required
> [!IMPORTANT]
> **Scope & Complexity**: The user has requested a "real working product" with full features. This plan shifts focus from a UI replica to a **functional platform**.
> - **Backend First**: We will build a robust `FastAPI` backend that handles dynamic object creation, data ingestion (CSV/JSON), and real query execution.
> - **Visual Fidelity**: The UI will use a high-fidelity "Nexus Dark" design system based on Palantir's actual aesthetic (dense, technical, panel-based).

> [!NOTE]
> **Tech Stack**:
> - **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons, React Flow (Logic/Pipelines), Leaflet (Maps).
> - **Backend**: FastAPI (Python), SQLAlchemy, SQLite (Portability), Pydantic (Validation).
> - **Data**: Dynamic Schema (EAV or JSON-based) to support user-defined Ontologies without DB migrations.

## Proposed Changes

### 1. Nexus OS Core (The "Operating System")
#### [NEW] `nexus-os/packages/ui`
- **Design System**: Implement a "High Density" UI library.
    - `Panel`: Collapsible, resizable, dark-themed containers.
    - `DataGrid`: High-performance table with sorting/filtering.
    - `CodeEditor`: Monaco-like editor for logic.
    - `GraphNode`: Custom nodes for pipeline/logic builders.

> [!IMPORTANT]
> **CRITICAL UPDATE: REAL LOCAL INTELLIGENCE**
> The user demands a "real product" with a local 20B+ LLM. We will integrate **Ollama** (running `llama3` or `mixtral`) directly into the Nexus OS backend.
> - **AIP Core**: The backend will communicate with the local Ollama instance for all AI tasks.
> - **RAG Engine**: We will implement a vector store (FAISS or Chroma, locally) to index the Ontology for "Chat with Data".
> - **Full Depth**:
>     - **Foundry**: Real data pipelines transforming CSVs.
>     - **Gotham**: Real geospatial analysis using `geopandas` and Leaflet.
>     - **Apollo**: Real local container management (Docker).

## Proposed Changes

### 1. Nexus OS Core & AIP (The Intelligence Layer)
#### [MODIFY] `nexus-os/apps/api`
- **Local LLM Client**: Integrate `ollama` python client.
- **RAG Service**:
    - Index `ObjectInstance` properties into a local vector store.
    - Endpoint `POST /aip/chat`:
        1. Retrieve relevant objects from Vector Store.
        2. Construct prompt with context.
        3. Stream response from Ollama.
- **Agent Engine**:
    - Implement "ReAct" loop where the LLM can call API tools (e.g., `search_objects`, `create_object`).

### 2. Foundry (Data & Ops)
- **Pipeline Builder**: Implement a "Python Runner" that actually executes user-defined Python code on the data.

### 3. Gotham (Intel & Command)
- **Geospatial Engine**:
    - Ingest "Real" GeoJSON data (e.g., airports, conflict zones).
    - **Radius Search**: Backend endpoint to find objects within X km.
    - **Pattern Detection**: Simple algorithm to detect "convoys" (objects moving together).

### 4. Apollo (Delivery)
- **Container Manager**:
    - Connect to local Docker socket.
    - UI to "Deploy" a new service (spins up a real Nginx container).

## Verification Plan

### Automated Tests
- **Backend Tests**: `pytest` for API endpoints (Ontology CRUD, Search).
- **Frontend Tests**: Basic rendering tests for main pages.

### Manual Verification
- **Foundry Flow**:
    1. Go to Foundry > Ontology Manager.
    2. Create a new Object Type "Aircraft".
    3. Go to Object Explorer and verify "Aircraft" appears.
- **Gotham Flow**:
    1. Go to Gotham > Map.
    2. Verify map loads with dark theme.
    3. Click an entity on the map and see details in a sidebar.
- **AIP Flow**:
    1. Open AIP Terminal.
    2. Type "Show me all Aircraft".
    3. Verify it returns a list of objects (mocked response).
