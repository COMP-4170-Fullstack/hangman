-- Run this in Supabase SQL Editor: SQL Editor > New query > paste and Run
-- This creates a trigger that auto-creates a profile when a new user signs up.

-- 1. Create the trigger function (uses user_name - required by your profiles table)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text := coalesce(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8));
begin
  insert into public.profiles (id, user_name, username, total_score, games_played, games_won)
  values (new.id, uname, uname, 0, 0, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Create the trigger (runs when a user is inserted into auth.users)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3. Backfill: create profiles for existing users who don't have one
insert into public.profiles (id, user_name, username, total_score, games_played, games_won)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'username', 'player_' || substr(u.id::text, 1, 8)),
  coalesce(u.raw_user_meta_data->>'username', 'player_' || substr(u.id::text, 1, 8)),
  0, 0, 0
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
