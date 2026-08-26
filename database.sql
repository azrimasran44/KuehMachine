-- Kueh Machine: The Great Reverse Makan — HDB Panic
-- Private per-player progress (high score), following DATABASE.md's
-- "own project folder" workflow: this file goes in the zip handed to
-- Leonard, who runs it against the shared Supabase project and adds it
-- to supabase/migrations/ during integration.
--
-- Shape: one row per signed-in user, single jsonb column, RLS locked to
-- auth.uid() — same pattern as the ken_collection example in DATABASE.md.

create table if not exists kueh_hdb_panic_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table kueh_hdb_panic_progress enable row level security;

create policy "select own progress"
  on kueh_hdb_panic_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on kueh_hdb_panic_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on kueh_hdb_panic_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
