-- Fix: Add proper PRIMARY KEY constraint to profiles table
-- This fixes the 42P10 "no unique constraint" error

-- First, check current constraints
SELECT conname, contype, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'profiles';

-- If no primary key exists, add it
-- WARNING: This requires the column to NOT have duplicates
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'profiles'::regclass 
        AND contype = 'p'
    ) THEN
        -- Add primary key if not exists
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Also add unique constraint on username if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'profiles'::regclass 
        AND conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Verify
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
