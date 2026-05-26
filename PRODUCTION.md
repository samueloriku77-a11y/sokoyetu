Production checklist
====================

Minimal production readiness checklist for SokoYetu:

- Use a managed database (Postgres/MySQL) with credentials in environment variables.
- Set `DATABASE_TYPE` and `DATABASE_URL` environment variables in the host.
- Configure a strong `JWT_SECRET` and other secrets via environment variables.
- Use object storage (S3 / MinIO) for uploads; do not serve uploads from local disk in prod.
- Enable HTTPS and set `ALLOWED_ORIGINS` to your front-end origin(s).
- Configure rate limiting and request size limits for upload endpoints.
- Scan and restrict uploaded file types and sizes; validate images server-side.
- Set up monitoring, alerting, and regular backups for the DB and object storage.
- Add an admin workflow for `id_verified` approvals and audit logs.

CI notes
- CI runs formatting and tests. It does not run flake8 per project preference.
