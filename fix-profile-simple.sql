-- Create function WITHOUT ON CONFLICT
-- Just try INSERT, if fails then UPDATE

CREATE OR REPLACE FUNCTION public.save_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT DEFAULT '',
    p_bio TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_exists;
    
    IF v_exists THEN
        -- Update existing
        UPDATE profiles 
        SET username = p_username,
            display_name = p_display_name,
            bio = p_bio,
            updated_at = NOW()
        WHERE id = p_user_id;
    ELSE
        -- Insert new
        INSERT INTO profiles (id, username, display_name, bio)
        VALUES (p_user_id, p_username, p_display_name, p_bio);
    END IF;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- If any error, try update as fallback
    UPDATE profiles 
    SET username = p_username,
        display_name = p_display_name,
        bio = p_bio
    WHERE id = p_user_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.upsert_profile;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.save_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_profile TO anon;

-- Verify
SELECT proname FROM pg_proc WHERE proname = 'save_profile';
