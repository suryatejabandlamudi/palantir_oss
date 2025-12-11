# Python Environment Setup Guide for Nexus OS

This guide details how to set up the Python environment for running the AI Agent verification scripts and RAG pipeline.

## Prerequisites

- Python 3.10+
- `pip` (Python Package Manager)
- `virtualenv` (optional but recommended)

## Setup Steps

1.  **Navigate to the project root:**
    ```bash
    cd /path/to/nexus_os
    ```

2.  **Create a Virtual Environment:**
    It is recommended to use a virtual environment to isolate dependencies.
    ```bash
    python3 -m venv .venv
    ```

3.  **Activate the Virtual Environment:**
    - **macOS/Linux:**
        ```bash
        source .venv/bin/activate
        ```
    - **Windows:**
        ```bash
        .venv\Scripts\activate
        ```

4.  **Install Dependencies:**
    Install the required Python packages from `requirements.txt`.
    ```bash
    pip install -r requirements.txt
    ```
    *Note: If `requirements.txt` is missing, install the core dependencies manually:*
    ```bash
    pip install google-generativeai python-dotenv chromadb flask
    ```

## Environment Variables

Ensure your `.env` file (in `nexus_os/apps/web/.env` or project root) contains the necessary keys:

```env
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL="file:./nexus.db"
```

## Running Verification Scripts

To run the Python-based verification scripts (e.g., `verify_rag.py` or legacy scripts):

```bash
# Ensure venv is active
source .venv/bin/activate

# Run script
python3 scripts/verify_rag.py
```

## Troubleshooting

- **Module Not Found:** Ensure you activated the virtual environment (`source .venv/bin/activate`) before running python.
- **API Key Errors:** Verify `GOOGLE_API_KEY` is set in your environment or `.env` file.
