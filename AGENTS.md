# Agents

## Cursor Cloud specific instructions

### Overview

Brainwave.ai is an AI-powered EdTech platform (Next.js 14 frontend + FastAPI backend + AI microservice). All services run via Docker Compose.

### Starting services

```bash
# Copy env file if not present
cp -n .env.example .env

# Start core services (infrastructure + app)
sudo docker compose up -d postgres redis minio minio-init backend frontend

# Optional: AI features (resource-heavy, needs GPU ideally)
# sudo docker compose up -d ollama qdrant ai-services
```

- **Frontend**: http://localhost:3000 (Next.js 14)
- **Backend API**: http://localhost:8000 (FastAPI, docs at `/api/docs`)
- **MinIO Console**: http://localhost:9001

### Known gotchas

- **bcrypt/passlib incompatibility**: The `passlib[bcrypt]==1.7.4` dependency is incompatible with `bcrypt>=4.1`. After building the backend Docker image, run `sudo docker compose exec backend pip install 'bcrypt==4.0.1'` and restart the backend to fix user registration/login. Without this fix, any password hashing operation returns a 500 error.
- **Frontend ESLint**: The repo ships without an `.eslintrc.json`. Running `next lint` interactively prompts for config selection. Create `frontend/.eslintrc.json` with `{"extends": "next/core-web-vitals"}` to run lint non-interactively. The codebase has pre-existing lint errors (unescaped entities, missing hook deps) that cause `next build` to fail locally when ESLint is configured.
- **Database auto-creates tables**: `backend/main.py` calls `Base.metadata.create_all()` on startup — no Alembic migration versions exist yet, so `alembic upgrade head` is a no-op.
- **Trailing slash redirects**: FastAPI redirects `/api/v1/courses/` → `/api/v1/courses` (307). Use paths without trailing slash.

### Lint and build

- **Frontend lint**: `cd frontend && npx next lint`
- **Frontend build** (in Docker): `sudo docker compose build frontend`
- **Backend build** (in Docker): `sudo docker compose build backend`
- No automated test suite exists in this repo.

### Docker

Docker must be running (`sudo dockerd` if not started). The environment uses `fuse-overlayfs` storage driver and `iptables-legacy` for Docker-in-Docker compatibility.
