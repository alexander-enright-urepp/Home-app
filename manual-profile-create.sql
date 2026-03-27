-- Create profile for current user
-- Run this in Supabase SQL Editor with your actual user ID

-- Get your user ID first:
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create profile (replace USER_ID with actual UUID):
INSERT INTO profiles (id, username, display_name, bio)
VALUES (
  'USER_ID_HERE',
  'yourusername',
  'Your Name',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name;

-- Verify
SELECT * FROM profiles WHERE id = 'USER_ID_HERE';
