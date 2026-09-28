# EduConnect

**A student–expert mentorship platform.** Students share study materials, ask questions in a community board and request mentorship from verified experts; experts accept requests and chat with their mentees; admins moderate the platform.

Built with **Next.js 14 (App Router) + Tailwind CSS** on the frontend and **NestJS + TypeORM + PostgreSQL** on the backend.

---

## At a glance

| | |
|---|---|
| **Roles** | Student · Expert (mentor) · Admin |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Axios, lucide-react |
| **Backend** | NestJS 10, TypeORM, PostgreSQL, JWT, bcrypt, class-validator, Multer, Nodemailer |
| **Rendering** | SSR for public listing/detail pages, CSR for authenticated & interactive pages |
| **Run it** | `docker compose up --build` → http://localhost:3000 (login page is the landing page) |

## What users can do

- **Sign in / register** as a student or expert, verify email, reset a forgotten password
- **Course materials** – upload files, live-search, download, and bookmark favourites
- **Community Q&A** – post questions, reply, upvote, and mark an accepted answer (post becomes *Resolved*)
- **Mentorship** – students send a request to an expert; the expert accepts or declines; acceptance auto-creates a chat
- **Chat** – simple one-to-one messaging between mentor and mentee
- **Notifications** – in-app bell (plus email) for requests, replies and messages
- **Admin panel** – platform statistics, approve experts, delete users
- **Dark mode**, responsive layout, skeleton loaders, 404 and error pages

---

## Quick start

### Option A – Docker (recommended)
```bash
docker compose up --build        # no .env needed: the compose file sets the DB credentials
```
| Service | URL |
|---|---|
| App (login page) | http://localhost:3000 |
| REST API | http://localhost:4000/api |
| Adminer (DB viewer) | http://localhost:8080 |

Then seed demo data (optional): `docker compose exec backend npx ts-node src/database/seed.ts`

Optional Gmail: `SMTP_USER=you@gmail.com SMTP_PASS=<app password> docker compose up --build`

### Option B – Local
```bash
# 1. PostgreSQL
docker run -d --name educonnect-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=educonnect -p 5432:5432 postgres:16-alpine

# 2. Backend  (http://localhost:4000/api)
cd backend && cp .env.example .env && npm install
npm run start:dev
npm run seed            # optional demo users

# 3. Frontend (http://localhost:3000)
cd frontend && cp .env.local.example .env.local && npm install
npm run dev
```
**Database credentials** (host, user, password, DB name) are set in `backend/.env`.

### Demo accounts (after seeding)
| Role | Email | Password |
|---|---|---|
| Admin | admin@educonnect.dev | Password123! |
| Expert | expert@educonnect.dev | Password123! |
| Student | student@educonnect.dev | Password123! |

> **Email (optional):** without SMTP settings nothing breaks — the backend console prints a warning and the password-reset link. To send real emails with Gmail, set `SMTP_USER` (your Gmail) and `SMTP_PASS` (a Google *App Password*) in `backend/.env`. Mail only reaches real inboxes, so test forgot-password with an account registered using your own email.
> JWT secrets are fixed constants in `backend/src/auth/jwt.constants.ts` (no `.env` entries needed for this course project).

---

## Architecture

```
Browser ──► Next.js (SSR + CSR) ──Axios──► NestJS REST API ──TypeORM──► PostgreSQL
                                              │
                                              ├── JWT auth + role guards
                                              └── Nodemailer (SMTP)
```

```
educonnect/
├── backend/src/
│   ├── auth/            register, login, refresh, verify email, reset password, JWT strategy, guards
│   ├── users/           profiles (student / expert), expert directory
│   ├── materials/       upload, search, edit (PUT), delete
│   ├── posts/           community posts, comments, upvote, resolve
│   ├── mentorship/      request → accept / reject (creates conversation)
│   ├── bookmarks/       many-to-many: users ⇄ materials
│   ├── chat/            conversations + messages (REST)
│   ├── notifications/   in-app notifications
│   ├── mailer/          email templates + service
│   ├── admin/           analytics and moderation
│   └── database/        entities, seed script
└── frontend/
    ├── app/             folder-based routes (+ loading / not-found / error / layouts)
    ├── components/      Navbar, FormField, cards, client components, RequireAuth
    └── lib/             axios client (with token refresh), server axios, validation helpers
```

### Database relationships
- **One-to-One** – `User ⇄ StudentProfile`, `User ⇄ ExpertProfile`
- **One-to-Many** – `User → CourseMaterial`, `Post → Comment`, `Conversation → Message`, `User → MentorshipRequest`
- **Many-to-Many** – `User ⇄ CourseMaterial` through the `bookmarks` join table

---

## Requirements coverage (where to look)

### Frontend
| Requirement | Implementation |
|---|---|
| **12+ Axios calls, CSR/SSR by scenario** | ~35 call sites (each marked `// AXIOS …` in code). **SSR** (Server Components via `lib/server-api.ts`): `app/materials`, `app/community`, `app/community/[id]`, `app/experts/[id]`. **CSR** (`lib/api.ts`, hooks/handlers): login, register, dashboards, chat, admin, profile, search, uploads, bookmarks, notifications. |
| **Layout with components + Tailwind** | Shared `Navbar`, `NotificationBell`, `FormField`, `PostCard`, `MaterialCard`, `DashboardSidebar`, `ChatBubble`; root `layout.tsx`; Tailwind design tokens in `tailwind.config.ts` |
| **Routing** | Folder-based routes; **dynamic** `community/[id]`, `experts/[id]`, `chat/[conversationId]`; **`loading.tsx`** (root, materials, community); **`not-found.tsx`**; **`error.tsx`**; nested **`layout.tsx`** guards |
| **Validation & authentication** | `lib/validation.ts` (email, password strength, lengths, file size) with inline error messages; JWT stored client-side, bearer header + automatic refresh-token retry in `lib/api.ts`; `RequireAuth` route guard with role checks (`admin` only for `/admin`) |

### Backend
| Requirement | Implementation |
|---|---|
| **7+ routes using GET / POST / PUT / PATCH / DELETE** | 35+ routes. **PUT**: `/materials/:id`, `/posts/:id` · **PATCH**: `/users/me`, `/posts/:id/resolve/:commentId`, `/mentorship/:id/respond` · **DELETE**: `/materials/:id`, `/bookmarks/:id`, `/admin/users/:id` · plus GET/POST throughout. Each has controller → service → TypeORM repository |
| **Pipes** | Global `ValidationPipe` (whitelist + transform) with `class-validator` DTOs; `ParseUUIDPipe` on all `:id` params |
| **Two+ relationship types, 3 CRUD routes** | One-to-One, One-to-Many and Many-to-Many (see above). Bookmarks (many-to-many): `POST /bookmarks/:materialId`, `GET /bookmarks`, `DELETE /bookmarks/:materialId` |
| **JWT + Guards** | `JwtStrategy`, `JwtAuthGuard`, `RolesGuard` + `@Roles()` decorator (e.g. admin-only controller, student-only mentorship requests) |
| **BCrypt + HttpException** | Passwords hashed with bcrypt (10 rounds) in `auth.service.ts`; explicit `HttpException` plus Nest exceptions (`NotFound`, `Forbidden`, `Unauthorized`…) |
| **Mailer (bonus)** | Nodemailer service: welcome, verification, password reset, mentorship request/status, new comment, digests |

**Not included:** Pusher real-time notifications (optional bonus). Notifications are stored in the database and shown in the navbar bell, refreshed by polling.

---

## API reference (prefix `/api`)

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout` · `/auth/verify-email` · `/auth/forgot-password` · `/auth/reset-password` |
| Users | `GET /users/me` · `PATCH /users/me` · `GET /users/experts?search=` · `GET /users/:id` |
| Materials | `GET /materials?search=&category=` · `GET /materials/:id` · `POST /materials` (multipart) · `PUT /materials/:id` · `DELETE /materials/:id` |
| Posts | `GET /posts` · `GET /posts/:id` · `POST /posts` · `PUT /posts/:id` · `POST /posts/:id/upvote` · `POST /posts/:id/comments` · `PATCH /posts/:id/resolve/:commentId` |
| Mentorship | `POST /mentorship/request` · `PATCH /mentorship/:id/respond` · `GET /mentorship/my-requests` |
| Bookmarks | `GET /bookmarks` · `POST /bookmarks/:materialId` · `DELETE /bookmarks/:materialId` |
| Chat | `GET /chat/conversations` · `GET|POST /chat/conversations/:id/messages` |
| Notifications | `GET /notifications` · `PATCH /notifications/read-all` · `PATCH /notifications/:id/read` |
| Admin | `GET /admin/analytics` · `GET /admin/users` · `PATCH /admin/experts/:id/approve` · `DELETE /admin/users|posts|materials/:id` |

## Security notes
bcrypt password hashing · short-lived JWT access tokens + refresh tokens · role-based guards · DTO validation with whitelisting · Helmet headers · CORS limited to the frontend origin · upload size limits.

## Known limitations / next steps
- Database schema uses TypeORM `synchronize` in development; switch to migrations for production
- Uploads are stored on local disk (swap for S3 in production)
- Chat and notifications use polling; WebSockets or Pusher would make them real-time
- No automated tests yet
# study-connect
