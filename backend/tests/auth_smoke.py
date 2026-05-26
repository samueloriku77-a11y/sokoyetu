import os
import sys

from fastapi.testclient import TestClient

# Force local sqlite for tests to avoid external DB connections
os.environ.setdefault("DATABASE_TYPE", "sqlite")
os.environ.setdefault("DATABASE_URL", "sqlite:///./sokoyetu_test.db")

# Ensure backend package dir is on sys.path for local test runs
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import backend.main as main
import backend.models as models
from backend.database import engine


def run_smoke():
    # Ensure a clean sqlite test DB for idempotent runs
    # The engine uses the process cwd, so the sqlite file is placed at the project root.
    db_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "sokoyetu_test.db")
    )
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
        except OSError:
            pass
    # Create tables (sqlite file in project)
    models.Base.metadata.create_all(bind=engine)

    client = TestClient(main.app)

    # Test registration for a driver (requires national_id)
    payload = {
        "email": "testdriver@example.com",
        "password": "password123",
        "name": "Test Driver",
        "phone": "0712345678",
        "role": "DRIVER",
        "national_id": "TEST-NID-0001",
        "user_id": "DR-0001",
    }

    r = client.post("/api/auth/register", json=payload)
    print("register status", r.status_code, r.text)
    if r.status_code != 200:
        return 1

    # Test login
    login = {"email": payload["email"], "password": payload["password"]}
    r2 = client.post("/api/auth/login/driver", json=login)
    print("login status", r2.status_code, r2.text)
    return 0 if r2.status_code == 200 else 2


if __name__ == "__main__":
    exit(run_smoke())
