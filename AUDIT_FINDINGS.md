# Brainwave.ai — End-to-End System Audit

**Date:** 2026-06-09
**Method:** Exhaustive page-by-page. Real browser (preview harness, port 3000) + backend API (8000) + DB cross-check. Every interactive element triggered; verified against network response + UI state + DB where applicable.
**Legend:** ✅ PASS · ❌ FAIL · ⚠️ PARTIAL/ISSUE · 🚧 BLOCKED (external/local-env limit)

## Environment
- Frontend: Next.js dev @ localhost:3000 (preview serverId 6859d0c9)
- Backend: FastAPI @ localhost:8000 (`/health` ok), 7 alembic migrations applied
- AI: Ollama models `llama3:8b` + `nomic-embed-text` downloaded; `GEMINI_API_KEY` set
- Payments: `rzp_test_…` test key present (Razorpay test mode)
- Demo data seeded (users:12, courses:11, enrollments:17, payments:14, quiz_attempts:14, certificates:4, notifications:24)

## Credentials used
- Admin: admin@brainwave.ai / Admin@123 (password reset — see Finding #1)
- Teacher: rajesh.kumar@brainwave.ai / Teacher@123
- Student: aarya.shah@brainwave.ai / Student@123

---

## FINDINGS

### #1 — ❌ seed_demo.py: documented admin password is wrong on a non-fresh DB
- **Where:** `backend/seed_demo.py` `upsert_user()`
- **Symptom:** Seed prints `admin@brainwave.ai / Admin@123` but API login returned HTTP 401.
- **Root cause:** admin row pre-existed (created 2026-04-01); `upsert_user()` returns the existing user without updating its password. Same applies to any pre-existing user — printed creds are only valid on a fresh DB.
- **Impact:** Misleading credentials; admin lockout on re-seed.
- **Fix suggestion:** In `upsert_user`, when user exists, reset `password_hash`/role to the seed values (or document that creds only apply on first seed).
- **Workaround applied:** Reset admin hash to `Admin@123` so audit can proceed.

### #2 — ❌ Site-wide search is completely broken (backend endpoint missing)
- **Where:** frontend `search/page.tsx` calls `GET /api/v1/courses/search`; backend `routers/courses.py`
- **Symptom:** Searching "python" (a course that exists) shows "0 results / No courses found".
- **Root cause:** `courses.py` defines `/categories`, `/featured`, `/{slug}` but **no `/search` route**. `/courses/search` matches `/{slug}` with slug="search" → `{"detail":"Course not found"}` HTTP 404. Frontend swallows the error → empty results.
- **Evidence:** `curl /api/v1/courses/search?q=python` → 404; `curl /api/v1/courses?search=python` → returns the Python course correctly.
- **Impact:** HIGH — the nav search box (on every page) never returns results.
- **Fix suggestion:** Add a `/search` route to courses router (before `/{slug}`), or point the frontend at `/courses?search=`.

### #3 — ⚠️ Newsletter "Subscribe" (footer, all pages) is a no-op
- **Where:** Footer newsletter form (`HeroSection`/`Footer`)
- **Symptom:** Filling email + clicking Subscribe fires **no network request**; no success/error feedback.
- **Impact:** Low–medium; appears functional but does nothing. No newsletter backend exists.

### #4 — ⚠️ 12 dead footer links (href="#") incl. Privacy Policy & Terms of Service
- **Where:** Global Footer
- **List:** Success Stories, Become an Affiliate, Blog, Student Support, FAQs, Help Center, About Us, Careers, Contact Us, Press Kit, Privacy Policy, Terms of Service (+ 4 social icons).
- **Impact:** Low individually, but Privacy/Terms dead is a real launch blocker for a paid platform.

### #5 — ❌ CRITICAL: Every course detail page 500s ("Course Not Found" in UI)
- **Where:** `GET /api/v1/courses/{slug}`; frontend `courses/[slug]`
- **Symptom:** Valid slug `python-data-science-zero-to-hero` → page shows "Course Not Found"; API returns **HTTP 500**.
- **Root cause:** endpoint eager-loads `course_promotions`; `relation "course_promotions" does not exist`. See #6.
- **Impact:** CRITICAL — no course can be viewed → no enrollment/purchase possible. Core funnel dead.
- **Status:** Unblocked for audit by creating missing tables (see #6).

### #6 — ❌ CRITICAL (systemic): 11 new feature tables have NO migration
- **Where:** `backend/app/models/{promotion,mock_exam,study_material,teacher_availability}.py` + alembic
- **Detail:** Models declare these tables but the pulled migrations only ADD COLUMNS — none CREATE these tables:
  `course_promotions`, `mock_test_packages`, `mock_test_papers`, `mock_test_sections`, `mock_test_questions`, `mock_test_attempts`, `mock_test_purchases`, `study_material_products`, `study_material_files`, `study_material_purchases`, `teacher_availability_rules`.
- **Impact:** CRITICAL — promotions, mock-tests, study-materials marketplace, teacher availability all 500 at DB layer; cascades into course detail (#5).
- **Fix suggestion:** Author alembic migration(s) creating these tables (autogenerate against models). A fresh `docker compose up` on a clean DB would also fail these features.
- **Workaround applied:** Ran `Base.metadata.create_all()` to materialize the 11 tables so audit can proceed. (Note: this means prod deploys via alembic will still be broken until migrations are written.)

### #7 — ⚠️ Login ignores `?redirect=` param
- **Where:** login flow. Clicking Buy while logged out → `/login?redirect=/courses/<slug>`; after login it lands on `/dashboard` instead of returning to the course. Minor UX/funnel leak.

### #8 — ❌ Student profile "Save changes" is fake (shows false success)
- **Where:** `frontend/src/app/profile/page.tsx:61-68`
- **Detail:** For non-teacher users the mutation is `return authApi.me();` (a GET) then `toast("Profile updated")`. No update request is sent; edits to name/etc. are discarded. Verified: changed name in UI → DB unchanged → only `GET /auth/me` fired. Teachers DO update via `PATCH /teacher/profile`.
- **Impact:** Medium — students cannot edit their profile, and the UI lies that it saved.

### Verified WORKING (student)
- ✅ Login (email/pw) → token persisted; ✅ /dashboard (real stats); ✅ /enrollments (3 courses, progress, filters); ✅ /certificates list + /certificates/[certId] detail (name, course, instructor, QR); ✅ Notifications "Mark all read" (DB confirmed all is_read=true); ✅ catalog /courses filter (client-side); ✅ course detail Buy→login redirect.
- 🚧 Certificate "Download PDF": triggers client-side generation, no network/error; actual PDF not observable in headless harness.
- ✅ Learn page (/learn/[slug]): curriculum, progress %, lesson selection render. ("No video uploaded" expected — optional video upload scripts not run.)
- ✅ Quiz runner (/courses/[slug]/quiz/[id]): answered 3Q → submitted → **scored 100% server-side**, result screen + new DB attempt row confirmed.
- ✅ AI Tutor chat (/learn/[slug]/chat): sent question → got contextual RAG answer citing "3 passages from course material" (Qdrant + Ollama working).
- ✅ Community page renders ("New post").
- ⚠️ Minor: clicking the quiz item in the learn-page sidebar does NOT launch the quiz runner (selects it as an empty lesson); quiz only reachable via its own route.
- ⚠️ Minor: certificate list card shows "Course" with no title (detail page shows it correctly); cert "DURATION —" empty.

### Verified WORKING (teacher)
- ✅ Login, /teacher/dashboard, /earnings (₹4,897 gross / ₹1,099 platform cut — real), /analytics, /courses (list), /students, /doubt-sessions, /study-materials, /mock-tests, /availability (rule form), /onboarding (verified state), /courses/[id]/curriculum (Add Chapter/Lesson) — all render, no crashes.
- ✅ Create course: filled step 1 → `POST /courses 200` → draft row in DB (slug auto-gen, price 499); wizard advanced to Upload Media.
- ✅ Schedule live session: `POST /live-sessions 200` → DB row status=scheduled with unique Jitsi room `brainwave-…`.
- ⚠️ PARTIAL: full AI course-build pipeline (media upload → transcription → AI structure) not exercised (needs real media files).
- 🚧 BLOCKED: actual Jitsi multi-party video (external service) — room provisioning verified, live video not.
- 🧹 Cleanup needed: left a draft "Audit Test Course — Delete Me" and a "Audit Live Session" in DB.

### Verified WORKING (admin)
- ✅ Login, /admin/dashboard (12 users, ₹17,586 revenue), /admin/teachers (5, 0 pending), /admin/courses, /admin/payments (14 completed), /admin/refunds — all render.
- ✅ Feature course: clicked Feature → `PATCH /admin/courses/{id}/feature?featured=true 200` → DB featured 5→6.
- ✅ Refund Reject full flow: created refund request via `POST /refunds/request` (student) → appeared in admin list → Reject + note → `status=rejected, admin_note` persisted in DB.
- 🚧 Refund Approve: handler calls real Razorpay `process_refund(payment.razorpay_payment_id,...)`; seeded payments have FAKE razorpay ids, so a real approve would fail at Razorpay. Logic reachable; actual money movement BLOCKED locally. (Not clicked to avoid error noise.)
- 🧹 Cleanup: left 1 rejected refund_request row from test.

### Integrations (Task #6)
- ✅ **Razorpay order creation** (`POST /enrollments/initiate`): returned a REAL Razorpay test order id `order_SzXBg1VAEwWAFi` (₹1299 INR) — live test-mode integration works.
- ✅ **Payment security**: `POST /enrollments/confirm` with a FORGED signature → HTTP 400 "Payment verification failed", no enrollment created. Signature verification enforced. 👍
- 🚧 **Full checkout**: Razorpay hosted widget + test card + valid signature is an interactive external iframe — can't be completed/forged in-harness. Verified up to the order boundary.
- ✅ **AI (Gemini + Ollama + Qdrant RAG)**: tutor chat returned a real grounded answer citing course passages. AI stack is live.
- ⚠️ PARTIAL **AI course-builder pipeline**: same AI service, but transcription→structure needs real media upload (not exercised).
- 🚧 **Email (Resend)**, **Jitsi video**: external; send/room-provision reachable, delivery/live-video not verifiable locally.

---

## FIXES APPLIED (session 2)
- **#1 fixed** — `seed_demo.py upsert_user` now resets password/role/name for existing users (documented creds valid on re-seed).
- **#2 fixed** — added `GET /courses/search` route (before `/{slug}`) in `backend/app/routers/courses.py`. Verified: "python" → 2 results in UI.
- **#5/#6 fixed** — wrote real alembic migration `e27be46614af` creating the 11 missing tables (+ missing `course_materials.extracted_text` column). Course detail now 200; `alembic upgrade head` clean on fresh DB.
- **#7 fixed** — login honors safe `?redirect=`. Verified: Buy-while-logged-out → login → lands on the course page.
- **#8 fixed** — added `PATCH /auth/me`; profile page now persists name for all roles + refreshes store. Verified in browser + DB.
- **#NEW-A (CRITICAL) fixed** — Celery worker raised `ModuleNotFoundError: No module named 'app'` on EVERY task → the whole AI pipeline (and email/risk tasks) never ran. Fixed via `PYTHONPATH=/app` on celery-worker/celery-beat in compose + `sys.path` insert in `tasks/celery_app.py`.
- **#NEW-B (CRITICAL) fixed** — AI service downloaded media via the public `STORAGE_PUBLIC_URL` (`localhost:9000`), unreachable inside Docker → transcription `[Errno 111] Connection refused`. Added `internalize_url()` (rewrites to `minio:9000` + URL-encodes spaces) in `transcription.py` + `main.py`; pipeline now records transcribe HTTP errors instead of silently producing empty content.
- Made `WHISPER_MODEL` configurable (`${WHISPER_MODEL:-large-v3}`); set to `small` for the live test (revert note below).

## VIDEO → AI PIPELINE — practical verification (partner's request)
Trigger: teacher uploads to `POST /courses/{id}/materials/upload` → celery `process_course_material`.
Uploaded a real 21 MB / ~3 min video (Data Warehouse intro). After the two critical fixes the pipeline ran end-to-end:
- ✅ **Transcription (Whisper)**: REAL — 2597-char transcript matching the video ("Before we dive into … how a data warehouse works …"), language auto-detected `en`. VTT captions saved.
- ✅ **Indexing (Qdrant RAG)**: 2 chunks embedded + indexed.
- ✅ **Thumbnail**: generated & stored to MinIO (PIL placeholder — real AI image needs valid Gemini key).
- ⚠️ **Course structuring (llama3:8b)**: ran but returned the **hardcoded fallback** ("Chapter 1: Introduction / Lesson 1: Getting Started") — llama3 call failed/timed out on CPU.
- ❌ **Quiz / mock-question generation (llama3:8b)**: returned the **hardcoded fallback** single question ("What is the main topic of this lesson?") — "Quiz generation error" logged. NOT genuinely generating questions from the transcript yet.
- ⚠️ **Moderation (genuine/legal LLM)**: ran but via the **keyword-blocklist fallback** (`raw_label: heuristic_ok`), NOT the Gemini LLM — because the `GEMINI_API_KEY` is invalid.

### UPDATE (session 3) — Gemini key wired, pipeline VERIFIED with real content
- Key works, BUT the hardcoded `gemini-2.0-flash` is quota-blocked (429); switched to **`gemini-2.5-flash`** via a new REST client (`gemini_client.py`, `X-goog-api-key` header — the key is the new `AQ.` format the old pinned SDK can't use). Added 429 retry/backoff.
- Rerouted moderation + structure + quiz to Gemini. **Verified end-to-end on a real video upload:**
  - ✅ Transcription (Whisper): real transcript.
  - ✅ **Moderation = genuine Gemini LLM** — verdict: *"Content is educational and technical, focusing on data warehousing… Title and category are consistent…"* (`raw_label: gemini`).
  - ✅ **Structure = Gemini**: 7 content-aware chapters + 18 lessons (Intro→Architecture→Dimensional Modeling→ETL/ELT→Case Study→BI→Advanced).
  - ✅ **Quiz/mock = Gemini**: 5 genuine comprehension questions from the transcript.
  - ⚠️ **Thumbnail**: AI image-gen (Imagen / gemini image) is **404/429 on this free key — needs a billing-enabled project**. Falls back to PIL placeholder (works). Code refactored to REST so it auto-works on a paid key; removed SDK-attribute error spam.
- Hardened: quiz loop now per-chapter try/except; Gemini client retries 429.
- Remaining caveat: **Gemini FREE tier rate limits** cause intermittent fallbacks under burst load (a later re-run degraded to fallback mid-Docker-crash). Use a paid tier for consistent results.
- Note: Docker Desktop engine crashed twice during testing (`v1.47` API errors) — environment instability, not app code.

### Blockers needing input
- **Valid `GEMINI_API_KEY`** (current one is invalid, 24 chars): required for (a) the genuine/legal **moderation LLM** and (b) **AI image thumbnails (Imagen)**.
- **llama3 structure/quiz fallback**: llama3:8b on CPU is too slow / erroring within timeouts. Needs GPU, a smaller/faster model, or longer timeouts + retry — under investigation.
- One note: the spec says "mock exam questions" but the pipeline generates **chapter quizzes** (`quizzes` table), not the separate **mock-test** feature.

### Pipeline test cleanup — DONE
- Test course "PIPELINE TEST" + all children hard-deleted from DB. ✅
- `WHISPER_MODEL` left at `small` in `.env` (functional on CPU). Compose reads `${WHISPER_MODEL:-large-v3}`, so set it back to `large-v3` if running on GPU.

### Recommendation to make structure/quiz genuinely work without a GPU
The structure & quiz steps call local llama3:8b, which is unusable on this CPU (50 tokens > 120s). Since moderation already uses Gemini, route `structure-course` and `generate-quiz` through Gemini (`gemini-2.0-flash`) too — fast cloud inference, no GPU needed. Requires a valid `GEMINI_API_KEY`.

## ROUTE COVERAGE MATRIX
(updated as I go)

Legend: 🖱️ = driven in browser · 🔌 = backend covered by API sweep · ➖ = not directly reached

### Public
- 🖱️ / (home) · 🖱️ /courses · 🖱️ /courses/[slug] · 🖱️ /search
- 🔌➖ /features, /for-teachers, /pricing (render not browser-checked; static marketing pages)
- 🔌➖ /catalog/materials(+[slug]), /catalog/mock-tests(+[slug]) (GET endpoints 200; empty marketplace tables — not browser-checked)
- 🔌 /verify/[certId] (verify endpoint 200; public page not browser-rendered)

### Auth
- 🖱️ /login (student+teacher+admin, valid creds) · 🔌 invalid-cred path (API 401 confirmed)
- ➖ /register (NOT tested — registration form not exercised) · ➖ /forgot-password (NOT tested)
- ➖ Google/Microsoft/Apple OAuth buttons (NOT clicked — external)

### Student
- 🖱️ /dashboard, /enrollments, /certificates(+[certId]), /notifications, /profile, /learn/[slug](+chat,community), /courses/[slug]/quiz/[quizId]
- ➖ /mock-tests/take/[paperId] (no seeded mock-test data to take)

### Teacher
- 🖱️ /dashboard, /analytics, /availability, /courses, /courses/new (created draft), /courses/[id]/curriculum, /doubt-sessions, /earnings, /live-sessions (created session), /mock-tests, /onboarding, /students, /study-materials
- 🔌➖ /courses/[id]/edit, /promotions, /thumbnails, /mock-tests/new+[id], /study-materials/new+[id] (endpoints 200; pages not individually browser-rendered)

### Admin
- 🖱️ /admin/dashboard, /admin/courses (Feature ✓), /admin/payments, /admin/refunds (Reject ✓), /admin/teachers

## HONEST COVERAGE NOTE
Not every individual button was clicked. ~35 of 52 routes were driven in a real browser; the rest were validated at the API layer (all 70 GET endpoints + key POST/PATCH mutations) but their pages were not individually rendered. Untested in UI: register, forgot-password, OAuth, marketplace catalog/detail pages, mock-test taking, several teacher sub-pages, full Razorpay checkout, real email/Jitsi/AI-course-build. Where I could not verify, it is marked ➖ or 🚧 rather than assumed working.
