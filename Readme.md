# Brainwave.ai

An AI-powered EdTech platform with end-to-end course creation, intelligent tutoring, real-time doubt sessions, and verified certificates.

## Architecture

```
frontend/          → Next.js 14 (App Router) + TypeScript + Tailwind
backend/           → FastAPI + SQLAlchemy + Celery + Redis
ai-services/       → FastAPI microservice (Ollama, Whisper, Qdrant, Gemini)
nginx/             → Reverse proxy
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic, Celery, Redis |
| AI | Llama 3 (Ollama), nomic-embed-text, Whisper, Gemini API |
| Vector DB | Qdrant 1.8.x |
| Storage | MinIO (S3-compatible) |
| Database | PostgreSQL 16 |
| Payments | Razorpay |
| Email | Resend |
| Video | Jitsi Meet, FFmpeg (HLS) |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone & Configure

```bash
git clone <repo>
cd Brainwave
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Services: http://localhost:8001
- MinIO Console: http://localhost:9001
- Qdrant Dashboard: http://localhost:6333/dashboard

### 3. Run Database Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### 4. Seed Demo Data

Base catalog:

```bash
docker-compose exec backend python seed.py
```

Launch/demo-ready sample data:

```bash
docker-compose exec backend python seed_demo.py
```

## Features

### Student Features
- Browse and search AI-powered courses
- Video player with HLS adaptive streaming
- Per-course AI chatbot (RAG with course content)
- Course community group discussions
- Quizzes with instant grading and explanations
- Live lectures via Jitsi Meet
- Book 1-on-1 or group doubt sessions with teachers
- Verified certificates upon course completion
- Progress tracking

### Teacher Features
- AI-powered course builder (upload PDF/PPT/video → AI structures it)
- Auto-generated quizzes from course content
- AI-generated thumbnails (Gemini)
- Student dropout risk alerts with nudge functionality
- Live session management
- Doubt session marketplace with payments
- Earnings dashboard and payout management
- Community moderation

### Admin Features
- Teacher verification workflow
- Course featuring and moderation
- Platform analytics dashboard
- Refund and payout processing

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API (thumbnail generation) |
| `RAZORPAY_KEY_ID/SECRET` | Razorpay payments |
| `RESEND_API_KEY` | Email service |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |

## Project Structure

```
Brainwave/
├── frontend/              # Next.js app
│   └── src/
│       ├── app/           # App Router pages
│       ├── components/    # Reusable UI components
│       ├── stores/        # Zustand state stores
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Utilities and API client
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic
│   │   ├── utils/         # JWT, email
│   │   └── middleware/    # Auth middleware
│   ├── tasks/             # Celery async tasks
│   ├── websocket/         # Socket.IO
│   └── alembic/           # DB migrations
├── ai-services/           # AI microservice
│   ├── transcription.py   # Whisper
│   ├── course_builder.py  # Llama 3
│   ├── quiz_generator.py  # Llama 3
│   ├── chatbot.py         # RAG chatbot
│   ├── indexer.py         # Qdrant indexing
│   └── thumbnail_generator.py  # Gemini
├── nginx/                 # Reverse proxy config
├── docker-compose.yml     # Full stack orchestration
└── .env.example           # Environment template
```

## API Documentation

Once running, visit:
- Backend API docs: http://localhost:8000/docs
- AI Services docs: http://localhost:8001/docs
- Backend health: http://localhost:8000/health
- Backend readiness: http://localhost:8000/ready

## AI Pipeline

When a teacher uploads course material:

1. **Upload** → MinIO storage
2. **Transcription** → Whisper (audio/video) or text extraction (PDF/PPT)
3. **Course Structure** → Llama 3 generates chapters, lessons, summaries
4. **Quiz Generation** → Llama 3 creates MCQ questions per lesson
5. **Embedding** → nomic-embed-text encodes content
6. **Indexing** → Vectors stored in Qdrant for RAG chatbot
7. **Thumbnail** → Gemini API generates course thumbnail
8. **Notification** → Teacher gets email + in-app notification

## Certificate Flow

1. Student completes all lessons (100% progress)
2. Celery task generates a PDF certificate via ReportLab
3. PDF uploaded to MinIO
4. Student receives email with certificate link
5. Public verification page: `/verify/{certId}`
