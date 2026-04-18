# Launch Checklist

## Infrastructure

- `docker compose up -d` starts `frontend`, `backend`, `ai-services`, `redis`, `postgres`, `minio`, and `qdrant`
- `alembic upgrade head` runs successfully in the backend container
- `GET /health` returns `200`
- `GET /ready` returns `200` with database, redis, and ai-service checks marked `true`

## Environment

- `JWT_SECRET` is replaced with a real secret
- Razorpay production keys are configured
- Resend API key is configured
- `FRONTEND_URL`, `BACKEND_URL`, and public storage URLs match the deployed domains
- MinIO buckets and object permissions are set the way the frontend expects

## Product Flows

- Student can register, log in, browse courses, enroll, open the learning player, and see progress update
- Teacher can complete onboarding, create a course, upload materials, monitor AI processing, and reach the edit flow
- Admin can approve onboarding, moderate courses, review refunds, and process payouts
- Certificate verification page works on a public URL

## Data

- Run `python seed_demo.py` if you need rich sample data for demos or QA
- Validate at least one teacher, one student, one course purchase, one certificate, and one admin account in production-like staging

## Final Verification

- Run a final production frontend build
- Run a backend startup smoke test
- Test one payment in sandbox before switching to production payment mode
