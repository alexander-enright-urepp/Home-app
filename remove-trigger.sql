-- Remove the broken trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify it's gone
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
