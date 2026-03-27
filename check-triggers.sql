-- Check for triggers on profiles table
SELECT 
    tgname AS trigger_name,
    tgenabled AS is_enabled,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'profiles';

-- Check for functions that might be handling inserts
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname LIKE '%profile%';
