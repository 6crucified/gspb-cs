# Authentication (Clerk + Next.js)

## Overview

- **Clerk** is the sole identity provider (sign-in, sign-up, sessions, profile UI).
- **Supabase (Postgres)** stores `UserProfile`, school memberships, roles, and all classroom data. Clerk handles login only; Supabase Auth is not used.
- The immutable **Clerk user ID** (`clerk_user_id`) is the external identity key. Email is not used as a permanent identifier.

## Environment variables

Configure in `.env` locally and as **Cloudflare Workers secrets** in production (never commit values).

| Variable | Client-safe | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend SDK |
| `CLERK_SECRET_KEY` | **No** | Server-side Clerk API |
| `CLERK_WEBHOOK_SIGNING_SECRET` | **No** | Verify Clerk webhooks (Svix) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | Post sign-in redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | Post sign-up redirect |
| `DATABASE_URL` | **No** | Supabase Postgres connection (pooler URI recommended) |
| `SUPABASE_URL` | Yes* | Project URL (*optional until storage features) |
| `SUPABASE_SECRET_KEY` | **No** | Service role key for server-side Supabase APIs (*optional) |
| `PLATFORM_SIGNUP_POLICY` | No | `open` \| `invite_only` \| `admin_only` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL for redirects |

## Next.js integration

- **Root layout**: `ClerkProvider` wraps the app (`apps/web/src/app/layout.tsx`).
- **Proxy (Next.js 16+)**: `apps/web/src/proxy.ts` uses `clerkMiddleware` + `createRouteMatcher`.
  - Public: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/clerk`, `/api/health`.
  - Protected: `/dashboard`, `/user-profile`, and other app/API routes.
- **Pages**: `/sign-in`, `/sign-up`, `/user-profile` use Clerk components with shared appearance tokens.
- **Navigation**: `AuthNav` exposes sign-in, sign-up, `UserButton`, and dashboard links without duplicating controls.

## User profile model (Supabase / Postgres)

Prisma model `UserProfile`:

- Internal UUID (`id`)
- `clerkUserId` (unique)
- `displayName`, `email`, `accountStatus`
- `createdAt`, `updatedAt`

School access is **only** via `SchoolMembership` (`platform_admin`, `school_admin`, `teacher`, `student`). Roles are per school.

## Webhooks

**Endpoint**: `POST /api/webhooks/clerk`

Subscribe in Clerk Dashboard to:

- `user.created`
- `user.updated`
- `user.deleted`

Processing:

1. Verify signature with `verifyWebhook` and `CLERK_WEBHOOK_SIGNING_SECRET`.
2. Idempotency via `svix-id` header → `processed_webhook_events`.
3. Updates touch identity fields only (never grades, assignments, or submissions).

Local testing: use Clerk Dashboard webhook tools or `clerk webhooks` CLI (forward to ngrok).

## Server-side authorization

Use `@clerk/nextjs/server` `auth()` (async) for Clerk session, then `@gspb-cs/auth` helpers:

- `requireAuthenticatedUser(clerkUserId)`
- `requireSchoolMembership({ userId, schoolId })`
- `requireSchoolRole({ userId, schoolId, minimumRole })`
- `requireClassAccess` / `requireWorkspaceAccess` (stubs until class/workspace tables exist)

Never trust client-supplied `schoolId` without a membership lookup.

Example API: `GET /api/schools/[schoolId]` returns 403 for cross-school access.

## Signup policy

- Platform default: `platform_settings.signup_policy` (seed: `invite_only`).
- Per-school override: `schools.signup_policy`.
- `assertSignupAllowedForSchool` enforces invitation/admin rules.
- A Clerk account alone does **not** grant school membership.

## Cloudflare Workers deployment

1. Build: `pnpm --filter @gspb-cs/web build:cf` (OpenNext for Cloudflare).
2. Deploy: `pnpm --filter @gspb-cs/web cf:deploy`.
3. Set secrets: `wrangler secret put CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `DATABASE_URL`.
4. Set vars: publishable Clerk key and public URLs via `wrangler.toml` `[vars]` or dashboard.
5. Configure Clerk production domain, redirect URLs, and webhook URL (`https://<your-domain>/api/webhooks/clerk`).

## Clerk CLI

Initial setup (from repo root, after `pnpm install`):

```bash
cd apps/web
pnpm dlx clerk@latest init
```

Do **not** re-run `init` against an existing claimed application unless linking intentionally. Accountless `init` may create a **claimable dev instance** with temporary keys—claim the app in Clerk Dashboard before production.

Verify:

```bash
cd apps/web
pnpm dlx clerk@latest doctor
```

## MCP (devoirs)

**Endpoint:** `POST https://<site>/api/mcp` (Streamable HTTP, MCP SDK v2)

The route verifies a **Clerk session JWT** sent as `Authorization: Bearer <token>`. Create a long-lived token from the Clerk Dashboard (JWT template) or reuse a browser session token while testing locally.

| Tool | Description |
|------|-------------|
| `add_devoir` | Publie un devoir (`classroomId`, `title`, `description`, `dueOn`, optional `files[]`) |
| `delete_devoir` | Supprime un devoir (`classroomId`, `assignmentId`) |

Only classroom teachers may call these tools. Connect Cursor or another MCP client to:

```text
https://gspb.codes/api/mcp
```

Local dev:

```text
http://localhost:3000/api/mcp
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| MCP 401 | Bearer token missing or expired; Clerk `authorizedParties` includes `NEXT_PUBLIC_SITE_URL` |
| Redirect loop | Clerk URLs match `/sign-in` and `/sign-up`; proxy public routes |
| 401 on `/api/me` | User signed in but no `UserProfile`—webhook delivery / signing secret |
| 403 on school API | Missing `SchoolMembership` row |
| Webhook 400 | `CLERK_WEBHOOK_SIGNING_SECRET` mismatch |
| Prisma errors on CF | `DATABASE_URL` secret set; `nodejs_compat` enabled |

## Production checklist

1. Claim Clerk application.
2. Production Clerk keys in Cloudflare secrets.
3. Production domain + HTTPS.
4. Authorized redirect URLs and webhook endpoint.
5. Supabase production project + schema applied (`pnpm db:push` or migrations).
6. End-to-end test: sign-up → webhook → dashboard → school API denial without membership.
