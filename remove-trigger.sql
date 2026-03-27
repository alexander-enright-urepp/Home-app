-- REMOVE TRIGGER - let app handle profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verify trigger is gone
SELECT 'Trigger removed' as status;
