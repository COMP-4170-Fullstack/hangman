-- Function to increment games_played and games_won for a user
create or replace function public.increment_games(user_id uuid, won boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    games_played = games_played + 1,
    games_won = games_won + case when won then 1 else 0 end,
    updated_at = now()
  where id = user_id;
end;
$$;
