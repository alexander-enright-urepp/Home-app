-- Create RPC function to handle profile creation/update
-- This bypasses the REST API ON CONFLICT issue

CREATE OR REPLACE FUNCTION create_or_update_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT DEFAULT '',
    p_bio TEXT DEFAULT ''
) RETURNS VOID AS $$
BEGIN
    -- Try to insert, if exists then update
    INSERT INTO profiles (id, username, display_name, bio)
    VALUES (p_user_id, p_username, p_display_name, p_bio)
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_or_update_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_or_update_profile TO anon;
