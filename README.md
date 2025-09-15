# Progress UK Web Platform

A full‑stack web platform for Progress UK. Frontend is an Expo Router (React Native for Web) app; backend is an Express API with Prisma/PostgreSQL. The platform covers member onboarding, authentication, events, newsroom, payments/subscriptions, policy editing via GitHub, Discord linking, and admin tools.

## Overview

- Frontend: Expo Router + React Native Web + TypeScript
- Backend: Express + Prisma + PostgreSQL + JWT
- Integrations: Stripe (subscriptions), Resend (email), Discord bot, GitHub App (policy repos), Cloudflare Turnstile
- Deploy: GitHub Actions to VPS for web build, optional Vercel configs in `frontend/` and `backend/`

## Project Structure

```
progress-web/
├── frontend/                 # Expo Router app (web + native)
│   ├── app/                  # Routes (index, join, login, account, events, newsroom, policy, etc.)
│   ├── components/           # Header, Footer, modals (create/edit event), SEOHead
│   ├── util/                 # `api.ts` client, auth/theme contexts, helpers
│   ├── assets/               # Icons, Lottie animations
│   ├── package.json          # Expo scripts (start, web, build:web)
│   └── app.json              # Expo config (web/native), public env
└── backend/                  # Express API server
    ├── routes/               # REST routes: users, events, news, subscriptions, policies, pending-users
    ├── controllers/          # Business logic for each route
    ├── middleware/           # `auth.js` JWT + role checks
    ├── prisma/               # Prisma schema/models (PostgreSQL)
    ├── scripts/              # Cronable scripts: complete events, cleanup, seed users
    ├── utils/                # Prisma client, email (Resend), Discord bot
    ├── public/               # Static (404.html, assets)
    └── server.js             # App bootstrap, CORS, cron jobs
```

## Local Development

Prerequisites

- Node.js 18+ (backend `engines.node >=16`, tested with 18/20)
- PostgreSQL (local or managed) and `DATABASE_URL`
- npm

1) Backend

```
cd backend
npm install
cp .env.example .env
# Edit .env: JWT_SECRET, DATABASE_URL, FRONTEND_URL, Stripe, Resend, GitHub, Discord...

# Create DB and generate/migrate Prisma
npx prisma generate
npx prisma migrate dev

# Optional: seed test users (test/admin/writer/event manager)
npm run seed:test-users

# Dev server (nodemon)
npm run dev   # listens on PORT (default 3000)
```

2) Frontend (Expo web)

```
cd ../frontend
npm install

# Configure backend URL for the client
# Option A: .env file
echo "EXPO_PUBLIC_BACKEND_API_URL=http://localhost:3000" >> .env
# Option B: one‑off env when running
# EXPO_PUBLIC_BACKEND_API_URL=http://localhost:3000 npm run web

npm run web   # opens Expo web dev server (CORS origin http://localhost:8081)
```

Notes

- CORS: backend allows `http://localhost:8081` by default (`backend/server.js`). If your Expo web origin differs, add it to the `allowedOrigins` list.
- Frontend default fallback is `http://localhost:3005` in `frontend/util/config.ts`. Prefer setting `EXPO_PUBLIC_BACKEND_API_URL` to your actual backend port.

## Environment Variables

Backend (`backend/.env`)

```
# Core
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/progress_db
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:8081

# Stripe subscriptions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Product/price IDs used at checkout
STRIPE_BASIC_PRODUCT_ID=price_...
STRIPE_PREMIUM_PRODUCT_ID=price_...

# Email (Resend)
RESEND_API_KEY=... 
RESEND_EMAIL="Progress Team <noreply@example.org>"

# Discord bot + role mapping (optional IDs)
DISCORD_BOT_TOKEN=...
DISCORD_GUILD_ID=...
DISCORD_LINKED_ROLE_ID=...
DISCORD_ADMIN_ROLE_ID=
DISCORD_ONBOARDING_ROLE_ID=
DISCORD_EVENT_MANAGER_ROLE_ID=
DISCORD_WRITER_ROLE_ID=
DISCORD_VOLUNTEER_ROLE_ID=
DISCORD_MEMBER_ROLE_ID=

# Cloudflare Turnstile (join form captcha)
CLOUDFLARE_TURNSTILE_SECRET_KEY=...

# GitHub App (policy management)
GITHUB_APP_ID=123456
GITHUB_INSTALLATION_ID=12345678
GITHUB_ORGANIZATION=your-org-or-user
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Dev helpers
SEED_TEST_USERS=true   # optional auto‑seed on start
```

Frontend (`frontend/.env`)

```
# Public values only
EXPO_PUBLIC_API_URL=https://your-site-root.example   # used for web console banner
EXPO_PUBLIC_BACKEND_API_URL=http://localhost:3000    # API base for client
# Optional: enable SW on mobile web
EXPO_PUBLIC_ENABLE_SW=true
```

Important: The GitHub Action uses `EXPO_PUBLIC_API_URL`. It currently sets `EXPO_BACKEND_API_URL` (without PUBLIC) which the app does not read. Prefer `EXPO_PUBLIC_BACKEND_API_URL` for builds.

## Data Model (Prisma)

- User: auth profile; `roles: UserRole[]` with precedence to derive a primary `role`
- Payment: subscription/donation tracking; Stripe IDs, status, billing interval
- NotificationPreferences and PrivacySettings: per‑user toggles
- Post and Reaction: newsroom content and emoji reactions
- Event, EventParticipant, VolunteerHours: events, registration, auto‑logged hours
- PendingUser and AccessCode: join applications, approval flow, registration codes
- DiscordVerificationCode and RefreshToken: Discord link and JWT refresh lifecycle

See `backend/prisma/schema.prisma` for enums and fields.

## API Overview

Base URL: `${BACKEND}/api`

Auth and Users

- POST `/users/register` — register (optional `accessCode` path via approvals)
- POST `/users/login` — login; returns `{ token, refreshToken }`
- POST `/users/logout` — revoke refresh token
- POST `/users/refresh` — exchange refresh for new access token
- GET `/users` — list users (roles: ADMIN or ONBOARDING)
- GET `/users/:id` — get user (owner or ADMIN)
- PUT `/users/:id` — update user (owner or ADMIN)
- DELETE `/users/:id` — delete user (owner or ADMIN)
- GET `/users/:id/notifications` | PUT `/users/:id/notifications`
- GET `/users/:id/privacy` | PUT `/users/:id/privacy`
- GET `/users/me/stats` — dashboard stats
- GET `/users/me/activity` — recent activity
- GET `/users/me/upcoming-events` — upcoming events
- Admin: GET `/users/management/stats`, GET `/users/:id/events`, PUT `/users/:id/role`, POST `/users/assign-event`, POST `/users/unassign-event`

Newsroom

- GET `/news` — list published posts (filter: `page`, `limit`, `category`, `search`, `featured`)
- GET `/news/:id` — view post (unpublished requires author or ADMIN)
- GET `/news/:id/reactions` — list reactions and summary
- Auth: POST `/news/:id/reactions` — add/update/remove reaction
- Writer/Admin: POST `/news` (create), GET `/news/author/my-posts`, PUT `/news/:id`, DELETE `/news/:id`

Events

- GET `/events` — list (filter: `eventType`, `status`, `search`, date range)
- GET `/events/:id` — details
- GET `/events/ical/:userId` — download iCal feed
- Auth: POST `/events/:id/register`, DELETE `/events/:id/register`, POST `/events/volunteer-hours`
- ADMIN/EVENT_MANAGER: POST `/events`, PUT `/events/:id`, DELETE `/events/:id`

Onboarding (Pending Users)

- POST `/pending-users/apply` — submit join application (Turnstile captcha)
- POST `/pending-users/validate-access-code` — pre‑registration validation
- Admin/Onboarding: GET `/pending-users`, GET `/pending-users/stats`, GET `/pending-users/:id`,
  POST `/pending-users/:id/approve`, POST `/pending-users/:id/reject`, PUT `/pending-users/:id/volunteer-details`, PUT `/pending-users/:id/status`

Subscriptions (Stripe)

- POST `/subscriptions/create-checkout` — returns Checkout `url`; requires `planId`, `billingInterval`, `metadata.email`
- GET `/subscriptions/subscription` — current subscription (auth)
- POST `/subscriptions/cancel` | `/reactivate` | `/update-payment-method` — manage subscription
- POST `/subscriptions/webhook` — Stripe webhook (raw body). Configure in Stripe or with `stripe listen`.

Policies (GitHub App)

- GET `/policies` — list repos in org/user starting with `policy-`
- GET `/policies/:repo/branches` — branches (excludes `main`)
- GET `/policies/:repo/pulls` | `/pulls/:id` | `/pulls/:id/reviews` | `/pulls/:id/comments` | `/pulls/:id/files`
- POST `/policies/:repo/pulls/:id/comments` — add PR comment (prepends app user name)
- GET `/policies/:repo/:path(*)` — fetch file (`policy.md`, `README.md`, etc.), supports `?ref=branch`
- POST `/policies/:repo/edit` — create/update file on branch; auto‑PR if new branch; supports `draft`
- PATCH `/policies/:repo/pulls/:id` — set PR `draft` true/false
- Admin: POST `/policies` (create repo `policy-<name>` with initial `policy.md`), POST `/policies/:repo/tags` (update README tags)

Health

- GET `/health` — health check

Auth Model and Roles

- JWT access tokens (15m) + DB‑stored refresh tokens (30d) with device fingerprints
- Roles are multi‑valued (`roles[]`): `ADMIN`, `ONBOARDING`, `EVENT_MANAGER`, `WRITER`, `VOLUNTEER`, `MEMBER`
- Middleware: `authenticateToken`, `requireAdmin`, `requireOwnerOrAdmin`, `requireRole([...])`

## Frontend App (Expo Router)

- Routes in `frontend/app/`: `/` (home), `/join`, `/login`, `/register`, `/account`, `/events`, `/events/[id]`, `/newsroom`, `/news/[id]`, `/policy`, `/policy/[repo]`, `/policy/[repo]/edit`, `/policy/[repo]/pr/[id]`, static pages (privacy, terms, eula).
- `util/api.ts`: Axios client with mobile‑aware timeouts, retry/backoff, background sync queue, caching, and offline handling. Exposes typed methods for all endpoints.
- `util/auth-context.tsx`: token storage (SecureStore on mobile, AsyncStorage on web), refresh on 403, auth guard, and helpers.
- `components/` include `createEventModal` and `editEventModal` for event CRUD, `Header` with role‑aware Nav and theme toggle.

## Background Jobs and Scripts

- Cron (in `backend/server.js`):
  - 00:00 daily — `completeEvents`: mark past events as `COMPLETED` and auto‑log volunteer hours for participants.
  - 02:00 daily — `cleanupOldRecords`: delete expired access codes and stale pending users.
- Scripts (`backend/package.json`):
  - `npm run seed:test-users` — create test users (member/admin/writer/event_manager)
  - `npm run complete:events` — one‑off completion run
  - `npm run cleanup:records` — one‑off cleanup run
  - `npm run dev:seed` — start server and auto‑seed in dev

## Emails and Discord

- Resend templates: submission acknowledgement, acceptance (includes single‑use Discord invite), Discord verification code.
- Discord bot (`backend/utils/discordBot.js`): DM commands — `link`, `unlink`, or 4‑digit code. On link, assigns Discord roles mapped from app `roles[]` using env‑configured role IDs.

## Stripe Subscriptions

- Checkout session uses product/price IDs from env and sets `success_url`/`cancel_url` from `FRONTEND_URL`.
- Webhook handler updates local `Payment` state for `checkout.session.completed`, `invoice.payment_succeeded/failed`, `customer.subscription.updated/deleted`.
- During checkout, if a user doesn’t exist yet, it creates a `User` from metadata.email.

## Deployment

GitHub Actions Workflow (`.github/workflows/build-deploy.yml`)

- Builds Expo web (`npm run build:web`) and deploys the `dist` folder to a VPS via SSH/SCP.
- Requires secrets: `SSH_PRIVATE_KEY`, `VPS_HOST`, `VPS_USER`, `EXPO_PUBLIC_API_URL`, and ideally `EXPO_PUBLIC_BACKEND_API_URL`.
- Restarts via PM2 on the server.

Vercel Configs

- `frontend/vercel.json`: SPA fallback routing
- `backend/vercel.json`: API CORS headers example

## Troubleshooting

- 403 Invalid/expired token: the client auto‑refreshes; if refresh fails, it logs out.
- CORS errors during local dev: ensure your Expo origin is in `allowedOrigins` in `backend/server.js`.
- No posts visible in Newsroom: GET endpoints are public, but the UI requires auth; log in first.
- Policy routes 500: verify GitHub App env vars (APP_ID, INSTALLATION_ID, PRIVATE_KEY, ORGANIZATION) are set and valid.
- Stripe webhook 400: make sure you’re sending the raw request body to `/api/subscriptions/webhook` and `STRIPE_WEBHOOK_SECRET` matches.
- Port mismatch: set `EXPO_PUBLIC_BACKEND_API_URL` to your backend port; backend default is `PORT=3000`.

## License

Copyright © Progress UK. See repository license terms.
