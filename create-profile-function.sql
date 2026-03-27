-- Create function to handle profile creation
-- This bypasses Supabase REST API's ON CONFLICT issue

CREATE OR REPLACE FUNCTION public.upsert_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT DEFAULT '',
    p_bio TEXT DEFAULT ''
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, bio)
    VALUES (p_user_id, p_username, p_display_name, p_bio)
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.upsert_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_profile TO anon;

-- Verify
SELECT proname FROM pg_proc WHERE proname = 'upsert_profile';
