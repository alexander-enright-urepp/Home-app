-- Check table health
SELECT 
    attname,
    atttypid::regtype,
    attnotnull,
    attnum
FROM pg_attribute
WHERE attrelid = 'profiles'::regclass
AND attnum > 0
ORDER BY attnum;

-- Check all constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- Test a simple insert
DO $$
BEGIN
    INSERT INTO profiles (id, username, display_name, bio)
    VALUES ('00000000-0000-0000-0000-000000000000', 'test', '', '');
    
    DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';
    
    RAISE NOTICE 'INSERT WORKS!';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'INSERT FAILED: %', SQLERRM;
END $$;
