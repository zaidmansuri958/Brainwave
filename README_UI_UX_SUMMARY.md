# Brainwave UI/UX Summary

## Quick Snapshot

- **Total frontend pages:** `44` (`frontend/src/app/**/page.tsx`)
- **Tech stack:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Design system style:** soft glassmorphism + gradient accents + rounded cards

## Color Theme (Current)

- **Base background:** warm paper tones (`#fffaf4` to `#f8f1e8`)
- **Primary brand color:** indigo (`#5b58f1`)
- **Secondary accent:** sky blue (`#35a8ff`)
- **Highlight accent:** amber (`#f2ad4b`)
- **Support accents:** mint (`#83d0b3`) and coral (`#ff8b69`)
- **Text colors:** deep ink (`#18212f`) + soft ink (`#5e6676`)

## UI Style

- Clean, premium, and modern SaaS-like interface
- Rounded corners and soft shadows for cards/panels
- Light gradient backgrounds with subtle texture/noise overlays
- Clear visual hierarchy using display fonts for headings and readable body typography
- Reusable utility classes for shells, cards, chips, actions, and hero panels

## UX Direction

- **Clarity first:** short headings, focused CTAs, and straightforward navigation
- **Conversion-aware:** strong top-level actions (`Get started`, `Join for free`, `Start teaching free`)
- **Motion used thoughtfully:** subtle micro-interactions and hover/press feedback
- **Responsive behavior:** mobile-first layouts with adaptive spacing and component stacking
- **Accessibility baseline:** visible focus styles, contrast-conscious text, clear click targets

## Product Experience (High-Level)

- Built for students and teachers with role-specific flows
- Key sections include landing, auth, dashboard, courses, learning, teacher tools, admin, and pricing
- Pricing UX emphasizes transparent commission tiers and trust-building information (stats + FAQs)

## Detailed Page Breakdown

- **Total pages:** `44`
- **Admin pages:** `1`
- **Teacher pages:** `20`
- **Student pages:** `17`
- **Auth pages:** `2`
- **Public/Marketing pages:** `4`

### Admin (`1`)

- `/admin/dashboard`

### Teacher (`20`)

- `/teacher/availability`
- `/teacher/courses`
- `/teacher/courses/[id]/curriculum`
- `/teacher/courses/[id]/edit`
- `/teacher/courses/[id]/promotions`
- `/teacher/courses/[id]/students`
- `/teacher/courses/[id]/thumbnails`
- `/teacher/courses/new`
- `/teacher/dashboard`
- `/teacher/doubt-sessions`
- `/teacher/earnings`
- `/teacher/live-sessions`
- `/teacher/mock-tests`
- `/teacher/mock-tests/[id]`
- `/teacher/mock-tests/new`
- `/teacher/onboarding`
- `/teacher/students`
- `/teacher/study-materials`
- `/teacher/study-materials/[id]`
- `/teacher/study-materials/new`

### Student (`17`)

- `/catalog/materials`
- `/catalog/materials/[slug]`
- `/catalog/mock-tests`
- `/catalog/mock-tests/[slug]`
- `/courses`
- `/courses/[slug]`
- `/courses/[slug]/quiz/[quizId]`
- `/dashboard`
- `/learn`
- `/learn/[slug]`
- `/learn/[slug]/chat`
- `/learn/[slug]/community`
- `/mock-tests/take/[paperId]`
- `/notifications`
- `/profile`
- `/search`
- `/verify/[certId]`

### Auth (`2`)

- `/login`
- `/register`

### Public / Marketing (`4`)

- `/`
- `/features`
- `/for-teachers`
- `/pricing`

## What Each Page Does + UI Style

Format: `Route -> Purpose | UI look`

### Public / Marketing

- `/` -> Main landing page for product value and conversion | Hero-first layout, gradient/illustration visuals, strong CTA buttons, modern glassmorphism navbar.
- `/features` -> Explains platform capabilities for students and teachers | Sectioned marketing blocks, icon cards, clean content hierarchy, benefit-focused copy.
- `/for-teachers` -> Teacher-focused acquisition page and onboarding pitch | Trust-building layout, educator-centric highlights, prominent "start teaching" CTAs.
- `/pricing` -> Teacher commission model and plan comparison | Card-based pricing tiers, stats strip, FAQ section, conversion CTA banner.

### Auth

- `/login` -> Sign-in for existing users | Minimal centered auth form, clear fields/actions, low-distraction layout.
- `/register` -> New account creation (student/teacher) | Structured onboarding-style form, role-aware options, clear primary action.

### Admin

- `/admin/dashboard` -> Platform-level operational control (teachers, courses, refunds, payouts, moderation) | Dense management dashboard, table/list views, action buttons, analytics + moderation workflows.

### Student

- `/dashboard` -> Student home with progress, learning status, and quick actions | KPI cards + activity widgets, summary panels, actionable next steps.
- `/profile` -> Student profile/account information management | Form-centric profile sections, editable personal fields, clean settings layout.
- `/notifications` -> Alerts for learning updates and account events | Feed/list-based interface with status markers and read-state behavior.
- `/search` -> Global search across courses/resources | Search-first UI with filters/results cards and quick navigation.
- `/learn` -> Aggregated learning hub/library for enrolled content | Content grid/list layout, progress indicators, continue-learning emphasis.
- `/learn/[slug]` -> Main course learning experience for a specific course | Lesson-focused layout, progression-aware navigation, content + supporting panels.
- `/learn/[slug]/chat` -> In-course AI/chat support for learners | Chat-style interface, message thread layout, assistant interaction pattern.
- `/learn/[slug]/community` -> Community discussion for a specific course | Social/discussion timeline UI with posts, replies, and engagement affordances.
- `/courses` -> Browse all courses available on platform | Discoverability UI with cards, filters/sorting, catalog exploration flow.
- `/courses/[slug]` -> Course detail page (overview, outcomes, purchase/enroll decision) | Product-detail style page, rich media + curriculum previews + CTA.
- `/courses/[slug]/quiz/[quizId]` -> Quiz attempt interface for course assessments | Focused assessment UI, question flow, submission/progress mechanics.
- `/catalog/materials` -> Browse paid/free study materials catalog | Marketplace-like listing grid with metadata and CTA actions.
- `/catalog/materials/[slug]` -> Study material detail and purchase/access info | Detail page pattern with preview info and conversion block.
- `/catalog/mock-tests` -> Browse mock test packages | Catalog cards with exam/test metadata and purchase/start actions.
- `/catalog/mock-tests/[slug]` -> Mock test package detail page | Detail layout with test structure, features, and enrollment/attempt CTA.
- `/mock-tests/take/[paperId]` -> Active mock test taking experience | Exam-focused, distraction-minimized interface with question navigation.
- `/verify/[certId]` -> Public certificate verification page | Trust/document-style page with verification status and certificate metadata.

### Teacher

- `/teacher/dashboard` -> Teacher command center (revenue, students, content performance) | Analytics dashboard with cards/charts/lists and quick actions.
- `/teacher/onboarding` -> Teacher verification/KYC and onboarding workflow | Multi-step form style, document/status guidance, approval-oriented UX.
- `/teacher/courses` -> Teacher’s course inventory management | Management table/grid with status badges and edit actions.
- `/teacher/courses/new` -> New course creation flow | Builder-style form/page sections for title, pricing, structure, publish setup.
- `/teacher/courses/[id]/edit` -> Edit existing course core details | Structured edit form with save/update controls and status context.
- `/teacher/courses/[id]/curriculum` -> Manage chapters/lessons sequence | Curriculum editor pattern with ordered modules and content operations.
- `/teacher/courses/[id]/thumbnails` -> Upload/manage course thumbnails/media | Media management UI with previews and asset actions.
- `/teacher/courses/[id]/students` -> View enrolled students per course | Roster/list view with progress and learner-level visibility.
- `/teacher/courses/[id]/promotions` -> Configure discounts/promotional pricing | Campaign-style settings UI with date/rule controls.
- `/teacher/students` -> Cross-course student analytics/engagement view | Student performance table/cards, filters, and intervention insights.
- `/teacher/earnings` -> Revenue and payout tracking | Finance dashboard UI with earnings breakdown, payout timeline, and summaries.
- `/teacher/availability` -> Configure availability for sessions/support | Time-slot scheduler style interface with weekday/time controls.
- `/teacher/live-sessions` -> Manage live class/session operations | Session list/calendar hybrid, scheduling controls, status/action buttons.
- `/teacher/doubt-sessions` -> Handle doubt-resolution bookings/interactions | Session queue/list UI with request detail and fulfillment actions.
- `/teacher/study-materials` -> Manage teacher-created material products | Product management table/card view with publish/status actions.
- `/teacher/study-materials/new` -> Create a new study material listing | Upload + metadata form workflow with pricing/publication controls.
- `/teacher/study-materials/[id]` -> View/edit a specific study material item | Detail management view with file/status/engagement context.
- `/teacher/mock-tests` -> Manage mock test products and papers | Assessment product dashboard with create/edit/manage actions.
- `/teacher/mock-tests/new` -> Create a mock test package/paper | Test builder workflow for structure, sections, and publishing.
- `/teacher/mock-tests/[id]` -> Edit/manage specific mock test package | Detailed assessment management page with paper/question configuration.
