-- Verify UNIQUE constraint was removed
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
AND conname LIKE '%username%';

-- Check all constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
