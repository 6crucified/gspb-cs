# gspb-cs

Browser-based CS classroom platform (greenfield). Identity: **Clerk**. Application data: **Supabase Postgres** (via Prisma). **Do not use Supabase Auth** — Clerk owns sign-in.

## Quick start

1. Copy `.env.example` to `.env` and fill in Clerk + `DATABASE_URL`.
2. `pnpm install`
3. `pnpm db:push` and `pnpm exec dotenv -e .env -- prisma db seed --schema prisma/schema.prisma`
4. `pnpm dev`

See [AUTHENTICATION.md](./AUTHENTICATION.md) for auth, webhooks, and Cloudflare deployment.
