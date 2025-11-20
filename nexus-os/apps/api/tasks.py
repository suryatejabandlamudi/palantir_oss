from celery_app import celery_app
from pipeline_engine import pipeline_engine
import models
from database import SessionLocal
from datetime import datetime

@celery_app.task(bind=True)
def run_pipeline_task(self, pipeline_id: str, input_names: list[str], output_name: str, code: str):
    """
    Async task to execute a pipeline.
    """
    db = SessionLocal()
    try:
        # 1. Update Status to RUNNING
        run = db.query(models.PipelineRun).filter(models.PipelineRun.pipeline_id == pipeline_id, models.PipelineRun.status == "PENDING").order_by(models.PipelineRun.started_at.desc()).first()
        if run:
            run.status = "RUNNING"
            db.commit()
        
        # 2. Execute Logic (CPU Bound)
        # In a real production system, this would spin up a Docker container
        # For now, we run it in the Worker process (still better than API process)
        result = pipeline_engine.execute_pipeline(
            code=code,
            input_types=input_names,
            output_type=output_name
        )
        
        # 3. Update Status based on Result
        if run:
            run.status = result["status"]
            run.logs = result["logs"]
            run.completed_at = datetime.utcnow()
            db.commit()
            
        return result
        
    except Exception as e:
        if run:
            run.status = "FAILED"
            run.logs = f"System Error: {str(e)}"
            run.completed_at = datetime.utcnow()
            db.commit()
        raise e
    finally:
        db.close()

@celery_app.task(bind=True)
def simulate_deployment_task(self, deployment_id: str):
    """
    Simulates a multi-stage deployment process.
    """
    import time
    db = SessionLocal()
    try:
        dep = db.query(models.Deployment).filter(models.Deployment.id == deployment_id).first()
        if not dep:
            return
        
        stages = [
            ("Downloading artifacts...", 2),
            ("Verifying checksums...", 1),
            ("Stopping old services...", 2),
            ("Applying database migrations...", 3),
            ("Starting new services...", 2),
            ("Running health checks...", 2)
        ]
        
        dep.status = "DEPLOYING"
        dep.logs = "--- Starting Deployment ---\n"
        db.commit()
        
        for stage_name, duration in stages:
            # Update logs
            dep.logs += f"[{datetime.utcnow().strftime('%H:%M:%S')}] {stage_name}\n"
            db.commit()
            
            # Simulate work
            time.sleep(duration)
            
        # Finish
        dep.status = "HEALTHY"
        dep.logs += f"[{datetime.utcnow().strftime('%H:%M:%S')}] Deployment Successful.\n"
        db.commit()
        
    except Exception as e:
        if dep:
            dep.status = "FAILED"
            dep.logs += f"\nERROR: {str(e)}\n"
            db.commit()
    finally:
        db.close()
