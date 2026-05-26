from fastapi.testclient import TestClient
import os
import sys

# Ensure backend package dir is on sys.path for local test runs
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import backend.main as main
from backend.database import engine
import backend.models as models


def run_smoke():
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
        "user_id": "DR-0001"
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
