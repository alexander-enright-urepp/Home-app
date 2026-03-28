-- Create debug function to test INSERT
CREATE OR REPLACE FUNCTION debug_insert_profile(
    p_user_id UUID,
    p_username TEXT
) RETURNS TEXT AS $$
DECLARE
    v_error TEXT;
BEGIN
    BEGIN
        INSERT INTO profiles (id, username, display_name, bio)
        VALUES (p_user_id, p_username, '', '');
        RETURN 'SUCCESS';
    EXCEPTION WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Test it
SELECT debug_insert_profile('11111111-1111-1111-1111-111111111111', 'testuser');

-- Clean up test
DELETE FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';
