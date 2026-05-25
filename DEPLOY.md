# Local deploy with Docker Compose

Prereqs: Docker, Docker Compose

Run the stack locally for development (builds backend, frontend, worker):

```bash
docker compose up --build
```

Services:
- backend: FastAPI on http://localhost:8000
- frontend: Vite preview on http://localhost:3000
- postgres: Postgres DB on 5432
- redis: Redis on 6379
- minio: S3-compatible storage on http://localhost:9000 (access: minioadmin/minioadmin)

Uploads are mounted to `backend/uploads`.

Run raw SQL migrations:

```bash
python infra/run_migrations.py
```

The script reads `DATABASE_URL` or uses backend/.env settings.
