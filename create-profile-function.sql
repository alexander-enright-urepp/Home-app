-- Create a function to insert profile without ON CONFLICT
CREATE OR REPLACE FUNCTION public.create_profile(
    user_id UUID,
    user_username TEXT,
    user_display_name TEXT DEFAULT '',
    user_bio TEXT DEFAULT ''
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, bio, is_premium)
    VALUES (user_id, user_username, user_display_name, user_bio, false);
EXCEPTION WHEN unique_violation THEN
    -- Profile already exists, ignore
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
