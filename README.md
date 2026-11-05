# gspb-cs

Browser-based CS classroom platform (greenfield). Identity: **Clerk**. Application data: **Supabase Postgres** (via Prisma). **Do not use Supabase Auth** — Clerk owns sign-in.

## Quick start

1. Copy `.env.example` to `.env` and fill in Clerk + `DATABASE_URL`.
2. `pnpm install`
3. `pnpm db:push` and `pnpm exec dotenv -e .env -- prisma db seed --schema prisma/schema.prisma`
4. `pnpm dev`

See [AUTHENTICATION.md](./AUTHENTICATION.md) for auth, webhooks, and Cloudflare deployment.

## Production (Cloudflare Workers)

- **Live URL:** https://gspb-cs-web.askr.workers.dev
- Deploy from repo root: `pnpm --filter @gspb-cs/web cf:deploy`
- Set Worker secrets: `CLERK_SECRET_KEY`, `DATABASE_URL`, `CLERK_WEBHOOK_SIGNING_SECRET` (`wrangler secret put`, run from `apps/web`).
- Clerk webhook endpoint: `https://gspb-cs-web.askr.workers.dev/api/webhooks/clerk`
- Local Clerk keys: `apps/web/.env.local` (from `clerk init`); root `.env` holds Supabase and overrides with `--override` in npm scripts.
