# Supabase (database only)

This project uses **Supabase Postgres** for application data. **Authentication is Clerk**, not Supabase Auth.

## Setup

1. Create a Supabase project.
2. Copy the **Database → Connection string → URI** (use **Transaction pooler** for Cloudflare Workers / serverless).
3. Set `DATABASE_URL` in the repo root `.env`.
4. Apply schema: `pnpm db:push` then `pnpm db:seed`.

Prisma schema lives in `prisma/schema.prisma`. You can add SQL migrations here later if you prefer `supabase db push` over Prisma migrate.
