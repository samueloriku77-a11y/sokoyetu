"""Entrypoint wrapper that exposes `app` for hosting platforms.
This imports the FastAPI `app` defined in `backend/main.py`.
The backend package contains some top-level imports (e.g. `import database`) so
ensure the `backend/` folder is on `sys.path` before importing.
"""

import os
import sys

# Ensure backend directory is on the import path so modules using bare imports
# like `import database` continue to work when importing `backend.main`.
ROOT = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
