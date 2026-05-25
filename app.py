"""Entrypoint wrapper that exposes `app` for hosting platforms.
This imports the FastAPI `app` defined in `backend/main.py`.
"""
from backend.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
