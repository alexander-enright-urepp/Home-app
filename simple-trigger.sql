-- Simple trigger to auto-create profile on signup
-- This is the SIMPLEST solution

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with email-based username
  INSERT INTO public.profiles (id, username, display_name, bio)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(EXTRACT(EPOCH FROM NOW()) % 10000),
    '',
    ''
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If insert fails (e.g., duplicate), just return
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
