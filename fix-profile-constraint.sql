-- Fix profiles table to properly support upsert
-- Run this in Supabase SQL Editor

-- First check current constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- If id is not PRIMARY KEY, add it:
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_pkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Verify
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
