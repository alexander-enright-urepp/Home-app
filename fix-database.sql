-- Remove the trigger that's not working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure profiles table has proper constraints
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE,
  ADD PRIMARY KEY (id);

-- Make sure RLS is enabled but policies allow inserts
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify
SELECT 'Trigger removed' as status;
SELECT conname as constraint_name, contype as type 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
