# Haftalik Reja — Rekruting jamoasi

A lightweight weekly-plan tracker for the Registon LC recruiting team, built with:

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (free tier) for shared team storage — falls back to **localStorage** when Supabase is not configured

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase configured, data is saved to your browser's localStorage — everything works, it's just not shared between people.

## Enable shared storage with Supabase (free)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Restart `npm run dev`. All changes now save to Supabase and are visible to everyone using the app.

> Note: the schema uses open row-level-security policies — anyone who can open the app can edit the plan (same "shared by link" model as the original). Add Supabase Auth later if you need per-user access control.

## Deploy

Deploy to [Vercel](https://vercel.com) (free): import the repo, add the two `NEXT_PUBLIC_SUPABASE_*` environment variables, and deploy. Share the URL with the team.

## Structure

```
app/                 layout, page, global styles (brand theme tokens)
components/plan/     weekly-plan (state + autosave), member-card, pulse-chart, report-table
components/ui/       shadcn/ui primitives
lib/                 types, seed data, stats helpers, supabase client, storage layer
supabase/schema.sql  database schema + RLS policies
```
