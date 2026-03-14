-- Remove the trigger that causes "Database error saving new user"
-- We will create profiles in the application code instead.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
