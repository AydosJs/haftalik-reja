-- Haftalik Reja — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run

create table if not exists public.plans (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

-- The app is a "shared by link" team tool: anyone with the anon key
-- (i.e. anyone using the deployed app) can read and write the plan.
create policy "public read" on public.plans
  for select using (true);

create policy "public insert" on public.plans
  for insert with check (true);

create policy "public update" on public.plans
  for update using (true);

-- Enable Realtime so every open tab receives live updates when the plan
-- changes, instead of holding a stale copy that overwrites others' edits.
alter publication supabase_realtime add table public.plans;
