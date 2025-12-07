import requests
from database import SessionLocal
import models
import auth

API_URL = "http://127.0.0.1:8000"

def seed_users():
    print("--- Seeding Users ---")
    
    # Create a local DB session to seed directly if API is protected (chicken/egg)
    # Or we can just use the API if we allow open registration for now, 
    # but let's do it via DB to ensure we can create a superuser easily.
    
    # Create tables if they don't exist
    from database import engine
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            print("Creating admin user...")
            hashed_pwd = auth.get_password_hash("palantir")
            admin_user = models.User(
                username="admin",
                email="admin@nexus.os",
                full_name="System Administrator",
                hashed_password=hashed_pwd,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created: admin / palantir")
        else:
            print("Admin user already exists.")
            
    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
