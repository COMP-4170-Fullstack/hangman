-- Fix: "Database error saving new user"
-- The trigger needs a policy that allows the auth service to insert profiles.
-- Run this in Supabase SQL Editor.

-- 1. Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Add policy to allow service role to insert (needed for the trigger)
-- The trigger runs when Auth creates a user; it needs to insert into profiles
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
  with check (auth.uid() = id);

-- Allow service_role to insert (for trigger context)
drop policy if exists "profiles_insert_service_role" on public.profiles;
create policy "profiles_insert_service_role" on public.profiles for insert
  to service_role
  with check (true);

-- 3. Recreate the trigger function (use empty search_path for security)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, total_score, games_played, games_won)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8)),
    0, 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
