-- Create missing profile for user
-- Run this in Supabase SQL Editor
-- Replace USER_ID with the actual user ID from auth.users

INSERT INTO profiles (id, username, display_name, bio)
SELECT 
  au.id,
  SPLIT_PART(au.email, '@', 1) || EXTRACT(EPOCH FROM NOW())::INT % 10000,
  '',
  ''
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.email IS NOT NULL;

-- Verify
SELECT au.id, au.email, p.username 
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;
