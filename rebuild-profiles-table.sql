-- Nuclear option: Rebuild profiles table with everything correct
-- WARNING: This will delete existing profiles!

-- Backup first
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Drop and recreate table
DROP TABLE IF EXISTS profiles CASCADE;

-- Create table fresh
CREATE TABLE profiles (
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

-- Create policies
CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Restore data (without duplicates)
INSERT INTO profiles (id, username, display_name, bio, avatar_url, created_at, is_premium)
SELECT DISTINCT ON (id) id, username, display_name, bio, avatar_url, created_at, is_premium
FROM profiles_backup
WHERE id IS NOT NULL;

-- Drop backup
DROP TABLE profiles_backup;

-- Verify
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'profiles'::regclass;
