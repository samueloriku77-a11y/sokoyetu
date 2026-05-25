#!/usr/bin/env python3
"""Run raw SQL migrations from infra/migrations against the configured DATABASE_URL.

Usage: from the repo root
  python infra/run_migrations.py

This script reads environment variables (or backend/.env via backend/config.py).
It creates a `schema_migrations` table to track applied files.
"""
import os
import glob
import datetime
from sqlalchemy import create_engine, text

# Load database config from backend.config to respect .env
try:
    from backend.config import DATABASE_URL
except Exception:
    DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise SystemExit('DATABASE_URL not set. Set env var or configure backend/.env')

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), 'migrations')

engine = create_engine(DATABASE_URL)

def ensure_migrations_table(conn):
    conn.execute(text('''
    CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP NOT NULL
    );
    '''))

def get_applied(conn):
    res = conn.execute(text('SELECT filename FROM schema_migrations')).fetchall()
    return set(r[0] for r in res)

def apply_sql_file(conn, path):
    with open(path, 'r', encoding='utf-8') as f:
        sql = f.read()
    print('Applying', os.path.basename(path))
    # execute whole file; may contain multiple statements
    conn.execute(text(sql))
    conn.execute(text('INSERT INTO schema_migrations (filename, applied_at) VALUES (:fn, :at)'), {'fn': os.path.basename(path), 'at': datetime.datetime.utcnow()})

def main():
    files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '*.sql')))
    if not files:
        print('No migration files found in', MIGRATIONS_DIR)
        return

    with engine.begin() as conn:
        ensure_migrations_table(conn)
        applied = get_applied(conn)
        for path in files:
            name = os.path.basename(path)
            if name in applied:
                print('Skipping already applied', name)
                continue
            apply_sql_file(conn, path)
    print('Migrations complete')

if __name__ == '__main__':
    main()
