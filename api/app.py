# Vercel Python serverless wrapper: expose ASGI `app` variable
# Vercel will build this file as a serverless function and use the `app` ASGI object.
from backend.main import app  # noqa: F401
