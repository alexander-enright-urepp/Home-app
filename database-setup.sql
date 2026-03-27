-- ONE CLEAN DATABASE SETUP
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_premium BOOLEAN DEFAULT FALSE,
    theme_preference TEXT DEFAULT 'default',
    custom_colors JSONB,
    custom_font TEXT DEFAULT 'dm-sans',
    remove_branding BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, bio)
    VALUES (
        NEW.id,
        COALESCE(
            SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(EXTRACT(EPOCH FROM NOW()) % 10000),
            'user_' || FLOOR(EXTRACT(EPOCH FROM NOW()) % 10000)
        ),
        '',
        ''
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If insert fails, still allow user creation
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

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Table created' as status;
SELECT conname as constraint_name, contype as type 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
SELECT tgname as trigger_name 
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass AND tgname = 'on_auth_user_created';
