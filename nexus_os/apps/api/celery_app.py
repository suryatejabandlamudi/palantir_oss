from celery import Celery
import os

# Use Redis as broker and backend
# In production, these would be env vars
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "nexus_compute",
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=["tasks"] # We will create tasks.py next
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Task Hard Time Limit (prevent infinite loops)
    task_time_limit=300,
)
