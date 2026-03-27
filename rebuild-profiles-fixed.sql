-- Fix: Rebuild profiles table
-- Specify columns explicitly

-- Backup existing data
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Drop and recreate table
DROP TABLE IF EXISTS profiles CASCADE;

-- Create table with all columns
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

-- Restore data with explicit columns
INSERT INTO profiles (
    id, username, display_name, bio, avatar_url, 
    created_at, updated_at, is_premium, theme_preference,
    custom_colors, custom_font, remove_branding
)
SELECT 
    id, username, display_name, bio, avatar_url,
    created_at, COALESCE(updated_at, created_at), is_premium, theme_preference,
    custom_colors, custom_font, remove_branding
FROM profiles_backup;

-- Drop backup
DROP TABLE profiles_backup;

-- Verify
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'profiles'::regclass;
