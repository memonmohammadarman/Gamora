-- GAMORA — STAGE 5 SUPABASE SCHEMA (idempotent — safe to re-run)
-- Run this whole file in your Supabase project's SQL Editor
-- (Supabase dashboard → SQL Editor → New query → paste this in → Run).
--
-- Every statement below is safe to run again on a project that already has
-- some or all of this in place: tables use IF NOT EXISTS (never touches
-- existing data), policies are dropped and recreated by name (redefining a
-- policy doesn't affect table rows), and the trigger function uses
-- CREATE OR REPLACE. Nothing here drops a table or deletes data.

-- =========================================================
-- 1. TABLES
-- =========================================================

-- One row per user, created automatically on signup (see the trigger below).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id text not null,
  created_at timestamptz default now(),
  unique (user_id, game_id)
);

create table if not exists public.recently_played (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id text not null,
  played_at timestamptz default now(),
  unique (user_id, game_id)
);

create table if not exists public.game_stats (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id text not null,
  high_score integer default 0,
  plays integer default 0,
  updated_at timestamptz default now(),
  unique (user_id, game_id)
);

-- =========================================================
-- 2. INDEXES
-- =========================================================
-- Every query GAMORA makes filters by user_id, so these keep lookups fast
-- as the tables grow.

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists recently_played_user_id_idx on public.recently_played(user_id);
create index if not exists game_stats_user_id_idx on public.game_stats(user_id);

-- =========================================================
-- 3. ROW LEVEL SECURITY
-- =========================================================
-- With RLS on and no policies, a table is fully locked down by default —
-- every policy below is an explicit exception to that. ENABLE is safe to
-- run even if RLS is already on.

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_played enable row level security;
alter table public.game_stats enable row level security;

-- Profiles: readable by anyone (usernames are meant to be public, e.g. for
-- Stage 6 leaderboards) but only editable by their own owner.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Favorites: fully private — a user can only see and change their own rows.
drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own favorites" on public.favorites;
create policy "Users can update their own favorites"
  on public.favorites for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Recently played: same pattern — fully private.
drop policy if exists "Users can view their own recently played" on public.recently_played;
create policy "Users can view their own recently played"
  on public.recently_played for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recently played" on public.recently_played;
create policy "Users can insert their own recently played"
  on public.recently_played for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recently played" on public.recently_played;
create policy "Users can update their own recently played"
  on public.recently_played for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own recently played" on public.recently_played;
create policy "Users can delete their own recently played"
  on public.recently_played for delete
  using (auth.uid() = user_id);

-- Game stats: same pattern — fully private (this is what keeps one
-- player from overwriting another player's high score).
drop policy if exists "Users can view their own game stats" on public.game_stats;
create policy "Users can view their own game stats"
  on public.game_stats for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own game stats" on public.game_stats;
create policy "Users can insert their own game stats"
  on public.game_stats for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own game stats" on public.game_stats;
create policy "Users can update their own game stats"
  on public.game_stats for update
  using (auth.uid() = user_id);

-- =========================================================
-- 4. AUTO-CREATE A PROFILE ROW ON SIGNUP
-- =========================================================
-- Supabase Auth stores the user in its own internal auth.users table, not
-- in a table you control — this trigger creates the matching public
-- profiles row the moment someone signs up, reading the username straight
-- out of the signup metadata (see signUpUser in js/auth.js).

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username')
  on conflict (id) do nothing; -- if a profile row somehow already exists, don't overwrite it
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();