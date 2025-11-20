# Nexus OS: Open Source Palantir Alternative

Nexus OS is a comprehensive, open-source operating system for the modern enterprise, designed to replicate the core capabilities of the Palantir ecosystem. It integrates data integration, decision-making, AI agents, and continuous delivery into a single, cohesive platform.

## Core Products

### 1. Foundry (Data Operations)
The backbone of the enterprise. Foundry manages the **Ontology**, the semantic layer that maps data to real-world concepts.
*   **Pipeline Builder**: Visual and code-based (Python/SQL) data transformation pipelines.
*   **Object Explorer**: Dynamic interface to explore, filter, and analyze any object type in the Ontology.
*   **Schema Evolution**: Automatically adapts the underlying DuckDB storage as your Ontology changes.

### 2. AIP (Artificial Intelligence Platform)
The brain of the operation. AIP integrates Large Language Models (LLMs) directly with your data and operations.
*   **Agent Studio**: Configure AI agents with specific tools and permissions.
*   **Dynamic Context**: Injects the live Ontology schema into the LLM's context, allowing it to understand your specific data model.
*   **Actionable AI**: Agents can query data (`query_ontology`), generate alerts (`create_alert`), and trigger pipelines.

### 3. Gotham (Decision & Operations)
The command center. Gotham provides a Common Operating Picture (COP) for mission-critical decisions.
*   **Live Map**: Real-time visualization of geospatial assets (e.g., Vessels, Ports).
*   **Mission Planning**: Interactive tools to draw zones, plan routes, and save mission overlays.
*   **Simulation**: Built-in simulation engine to mimic live data feeds for testing and training.

### 4. Apollo (Continuous Delivery)
The nervous system. Apollo manages the deployment and health of the software itself.
*   **Hub-and-Spoke Architecture**: Manage deployments across multiple environments (Dev, Staging, Prod).
*   **Orchestration**: Automated multi-stage deployment workflows (Download -> Verify -> Install -> Health Check).
*   **Live Telemetry**: Real-time streaming of deployment logs and system health metrics.

## Architecture

*   **Backend**: Python (FastAPI), SQLAlchemy, DuckDB (Analytical Store), Celery (Async Tasks).
*   **Frontend**: Next.js, React, Tailwind CSS, Deck.GL (Maps), Lucide Icons.
*   **AI**: Ollama (Local LLM), LangChain (Orchestration).

## Getting Started

### Prerequisites
*   Python 3.9+
*   Node.js 18+
*   Ollama (running `gpt-oss:20b` or similar on port 11434)

### Installation

1.  **Backend**:
    ```bash
    cd apps/api
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python main.py
    ```

2.  **Frontend**:
    ```bash
    cd apps/web
    npm install
    npm run dev
    ```

3.  **Access**:
    Open `http://localhost:3000` to access the Nexus OS portal.

## License
MIT
