# Nexus OS: Production Architecture & Roadmap

## Executive Summary
To transform Nexus OS from a high-fidelity prototype into a **Production-Grade Enterprise Operating System** (rivalling Palantir Foundry), we must move from a monolithic, local-process architecture to a distributed, secure, and scalable cloud-native system.

This document outlines the **Critical Issues**, **Target Architecture**, and **Implementation Roadmap**.

---

## 1. Critical Issues & Gaps (The "Why")

### A. Compute & Security (Critical)
-   **Current**: `pipeline_engine.py` uses `exec()` to run Python code inside the API process.
-   **Risk**: Remote Code Execution (RCE) vulnerability. A user can delete the DB or steal secrets.
-   **Risk**: Synchronous execution blocks the API. Long-running jobs freeze the UI.
-   **Fix**: **Containerized Async Compute**. Code must run in ephemeral Docker containers (sandboxed) orchestrated by a task queue (Celery/Temporal).

### B. Data Architecture (Scalability)
-   **Current**: Single local DuckDB file (`nexus.duckdb`).
-   **Risk**: Limited concurrency. Not suitable for TB/PB scale.
-   **Fix**: **Lakehouse Architecture**.
    -   **Storage**: S3/MinIO (Object Storage) with **Apache Iceberg** table format.
    -   **Compute**: DuckDB (for fast interactive queries) + Spark (for batch processing).
    -   **Catalog**: Unity Catalog or Hive Metastore.

### C. Ingestion & Integration (The "Real" Data)
-   **Current**: Simple CSV upload endpoint.
-   **Risk**: Cannot connect to real enterprise databases (Postgres, Oracle, Snowflake).
-   **Fix**: **Magritte Agents (CDC & Batch)**.
    -   **Airbyte Integration**: Wrap Airbyte CLI to allow users to sync data from Postgres/Snowflake via UI.
    -   **CDC**: Implement Change Data Capture using Debezium logic for real-time streams.

### D. Authentication & Governance
-   **Current**: Basic JWT (just implemented).
-   **Risk**: No Role-Based Access Control (RBAC). No Object-Level Security (OLS).
-   **Fix**: **OIDC Integration** (Keycloak) + **OPA (Open Policy Agent)** for fine-grained authorization.

---

## 2. Target Architecture (The "What")

```mermaid
graph TD
    subgraph "Control Plane (Kubernetes)"
        API[API Gateway (FastAPI)]
        Auth[Auth Service (Keycloak)]
        Meta[Metadata Store (Postgres)]
        Orch[Orchestrator (Temporal/Celery)]
    end

    subgraph "Data Plane"
        Ingest[Ingestion Agents (Airbyte)]
        Lake[Data Lake (S3 + Iceberg)]
        Compute[Compute Engine (DuckDB/Spark)]
    end

    subgraph "Frontend"
        Web[Nexus Web (Next.js)]
        Map[Gotham Map (Deck.gl)]
    end

    Web --> API
    API --> Auth
    API --> Meta
    API --> Orch
    Orch --> Compute
    Ingest --> Lake
    Compute --> Lake
```

---

## 3. Implementation Roadmap (The "How")

### Phase 1: The "Real" Foundation (Immediate)
1.  **Secure Compute**: Move `pipeline_engine` to a Celery Worker running in Docker.
2.  **Real Auth**: Enforce JWT on all endpoints. Add "Permissions" to the Ontology.
3.  **Postgres Metadata**: Move `models.py` (Object Types, Users) to PostgreSQL. Keep DuckDB *only* for data.

### Phase 2: Advanced Ingestion (The "Integration" Layer)
1.  **Connector Framework**: Create a standard interface for "Source Connectors".
2.  **Airbyte Integration**: Wrap Airbyte CLI to allow users to sync data from Postgres/Snowflake via UI.
3.  **Virtual Tables**: Allow querying external DBs directly without copying (Federated Querying via DuckDB).

### Phase 3: Enterprise Governance
1.  **Object-Level Security**: Filter rows based on user attributes (RLS).
2.  **Version Control**: Git integration for Pipeline Code and Ontology Definitions.
3.  **Audit Logging**: Track every read/write action.
