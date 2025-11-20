# Nexus OS: Roadmap to Supremacy

**Objective**: Build a production-grade, "real-size ready" operating system that surpasses the capabilities of the original Palantir ecosystem.

## Phase 1: Foundation & Prototype (Completed)
- [x] **Core Architecture**: Monorepo with Next.js (Frontend) and FastAPI (Backend).
- [x] **Ontology Engine**: Dynamic object types and link types using DuckDB.
- [x] **Gotham**: Geospatial visualization with Deck.gl.
- [x] **Foundry**: Object Explorer with AG Grid and Ontology Graph with React Flow.
- [x] **AIP**: RAG-enabled chat with Local LLM (GPT-OSS) and basic Tool Calling.

## Phase 2: Production Hardening (Current Focus)
The current system is a high-fidelity prototype. To become a "Real Product", we must address the following critical gaps:

### 1. System Architecture & Scalability
- **Issue**: DuckDB is running in-process. This limits concurrency and scalability.
- **Solution**: Migrate to a hybrid storage model. Use **PostgreSQL** for transactional metadata (Ontology definitions, Auth) and **DuckDB** (or ClickHouse) for high-performance analytical queries on object data.
- **Action**: Implement SQLAlchemy with Postgres for `models.py` and keep DuckDB for the analytical engine.

### 2. Distributed Compute (Foundry Pipelines)
- **Issue**: `pipeline_engine.py` executes Python code synchronously in the API process. This blocks the server and is unsafe.
- **Solution**: Implement an asynchronous worker queue using **Celery** and **Redis**.
- **Action**: Decouple pipeline execution from the API. Support long-running jobs and containerized execution (Docker-in-Docker) for isolation.

### 3. Security & Multi-Tenancy
- **Issue**: No authentication or authorization. Single-user mode.
- **Solution**: Implement **OIDC/OAuth2** (Keycloak or Auth0).
- **Action**: Add `Multi-user Auth` middleware. Implement Object-Level Security (OLS) and Role-Based Access Control (RBAC).

### 4. Apollo: Continuous Delivery & Deployment
- **Issue**: No deployment logic.
- **Solution**: Build a real "Apollo" control plane.
- **Action**: Implement an Agent that runs on target nodes (simulated as Docker containers) to manage upgrades, config injection, and health checks.

## Phase 3: Advanced Intelligence (AIP Evolution)
- **Issue**: `aip_tools.py` is hardcoded.
- **Solution**: Dynamic Tool Registry.
- **Action**: Allow users to define AIP Tools via the UI (Python functions) which are sandboxed and exposed to the LLM automatically.
- **Feature**: "AIP Logic" - Visual chain-of-thought builder for agents.

## Phase 4: User Experience Supremacy
- **Gotham**: Enable write-back (draw zones, route planning) on the map.
- **Foundry**: Visual Pipeline Builder (Node-based graph) instead of just code.
- **Workshop**: Drag-and-drop application builder (Low-code).

## Immediate Next Steps (Prioritized)
1.  **Authentication**: Secure the platform.
2.  **Async Compute**: Unblock the API.
3.  **Apollo Agent**: Demonstrate real deployment capabilities.
