DROP FUNCTION IF EXISTS public.create_profile(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_profile(
    user_id UUID,
    user_username TEXT,
    user_display_name TEXT DEFAULT '',
    user_bio TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (id, username, display_name, bio, is_premium)
        VALUES (user_id, user_username, user_display_name, user_bio, false);
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
