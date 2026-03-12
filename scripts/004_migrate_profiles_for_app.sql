-- Adapts your existing tables to work with the app
-- Run this after 001 and 002 if your profiles table has different structure

-- Add missing columns to profiles (if they don't exist)
alter table public.profiles add column if not exists total_score integer default 0;
alter table public.profiles add column if not exists games_played integer default 0;
alter table public.profiles add column if not exists games_won integer default 0;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- If your table has user_name but app expects username, add username
alter table public.profiles add column if not exists username text;
update public.profiles set username = user_name where username is null and user_name is not null;

-- Trigger: when user signs up via Supabase Auth, create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, total_score, games_played, games_won)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'player_' || substr(new.id::text, 1, 8)),
    0, 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Game table: allow users to insert their own games
alter table public.game enable row level security;
drop policy if exists "game_insert_own" on public.game;
create policy "game_insert_own" on public.game for insert with check (auth.uid() = user_id);
create policy "game_select_all" on public.game for select using (true);
