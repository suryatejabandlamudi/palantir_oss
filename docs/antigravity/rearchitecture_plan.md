# Nexus OS: Re-Architecture Plan (The "Real Product" Pivot)

> [!IMPORTANT]
> **Goal**: Move from "Prototype" to "Production-Grade Replica".
> **Target**: November 2025 Palantir Standards.
> **Constraint**: Local Mac Execution (High Performance, Low Latency).

## 1. Frontend Architecture: The "Workspace" Engine
The current page-based Next.js layout is too simple. We need a **Desktop-Class Web App**.

### [NEW] `packages/workspace-core`
- **Docking System**: Implement a tiling window manager (like VS Code or Golden Layout) within the browser.
    - *Why*: Users need to see the Map, Graph, and Object Details *simultaneously*.
- **State Management**: Move to `Zustand` or `Redux Toolkit` for global app state (not just page state).
- **High-Performance Rendering**:
    - **Data Grid**: `AG Grid` (Community) for handling 100k+ rows with virtualization.
    - **Graph**: `React Flow` or `Cosmos` (WebGL) for 10k+ nodes.
    - **Map**: `Deck.gl` over `Mapbox/Leaflet` for visualizing millions of points.

## 2. Backend Architecture: The "Kinetic" Engine
SQLite is fine for metadata, but we need "Real" analytics.

### [MODIFY] `apps/api`
- **Hybrid Database Strategy**:
    - **Metadata (Ontology Definitions)**: SQLite (Keep it simple, relational).
    - **Object Data (The "Big Data")**: **DuckDB**.
        - *Why*: Columnar storage, blazing fast analytical queries on local files (Parquet), supports SQL. Perfect for "Foundry" transformations on a Mac.
- **Task Queue**:
    - Implement `Celery` + `Redis` (or a lightweight async worker) for long-running jobs (e.g., "Ingest 10GB CSV", "Run Python Pipeline").

## 3. Intelligence Architecture: The "AIP" Core
We have GPT-OSS. Now we need **Agents**.

### [NEW] `apps/agent-runtime`
- **Tool Use**: Give GPT-OSS access to *real* tools:
    - `query_ontology(sql)`
    - `create_object(json)`
    - `run_pipeline(id)`
- **Context Window Management**: Smart RAG. Don't just dump text. Dump *schema* and *sample data*.

## 4. Implementation Roadmap

### Phase 1: The Foundation (Current Sprint)
- [ ] **DuckDB Integration**: Replace JSON-in-SQLite with DuckDB for Object Storage.
- [ ] **Workspace UI**: Build the "Docking" shell.

### Phase 2: Foundry & AIP
- [ ] **Real Pipelines**: Python scripts running against DuckDB.
- [ ] **AIP Agents**: "Create a pipeline that filters for X" -> Actually generates the Python code.

### Phase 3: Gotham
- [ ] **Deck.gl Map**: Visualize the DuckDB data on a 3D map.
