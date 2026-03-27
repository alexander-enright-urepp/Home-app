-- Home Linktree App - Premium Features Database Schema
-- Run this in your Supabase SQL Editor to add premium features

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXISTING TABLES (for reference)
-- ============================================
-- profiles table already exists
-- links table already exists

-- ============================================
-- NEW TABLE: Subscriptions
-- Tracks Stripe subscription status for each user
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT DEFAULT 'inactive', -- 'active', 'canceled', 'past_due', 'inactive'
    plan TEXT DEFAULT 'free', -- 'free', 'premium'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NEW TABLE: Link Clicks (Analytics)
-- Tracks every click on a link for analytics
-- ============================================
CREATE TABLE link_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    country TEXT
);

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Add premium fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_slug TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_colors JSONB; -- {primary: '#hex', secondary: '#hex', background: '#hex'}
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_font TEXT DEFAULT 'dm-sans';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS remove_branding BOOLEAN DEFAULT FALSE;

-- Add premium gating to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS analytics_count INTEGER DEFAULT 0;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user_id ON link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_slug ON profiles(custom_slug);

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies: users can only see their own subscription
CREATE POLICY "Users can view own subscription" 
    ON subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" 
    ON subscriptions FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can insert their own subscription  
CREATE POLICY "Users can insert own subscription" 
    ON subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Link clicks policies: users can only see their own clicks
CREATE POLICY "Users can view own link clicks" 
    ON link_clicks FOR SELECT 
    USING (auth.uid() = user_id);

-- Anyone can insert a click (for tracking public link clicks)
CREATE POLICY "Anyone can insert link clicks" 
    ON link_clicks FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update subscription status (called by webhook)
CREATE OR REPLACE FUNCTION update_user_subscription(
    p_user_id UUID,
    p_stripe_customer_id TEXT,
    p_stripe_subscription_id TEXT,
    p_status TEXT,
    p_period_end TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update subscription
    INSERT INTO subscriptions (
        user_id, stripe_customer_id, stripe_subscription_id, 
        status, plan, current_period_end, updated_at
    ) VALUES (
        p_user_id, p_stripe_customer_id, p_stripe_subscription_id,
        p_status, 
        CASE WHEN p_status = 'active' THEN 'premium' ELSE 'free' END,
        p_period_end, NOW()
    )
    ON CONFLICT (stripe_subscription_id) 
    DO UPDATE SET
        status = p_status,
        plan = CASE WHEN p_status = 'active' THEN 'premium' ELSE 'free' END,
        current_period_end = p_period_end,
        updated_at = NOW();

    -- Update profiles table
    UPDATE profiles 
    SET is_premium = (p_status = 'active'),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to count link clicks (for analytics)
CREATE OR REPLACE FUNCTION get_link_click_count(
    p_link_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    click_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO click_count
    FROM link_clicks
    WHERE link_id = p_link_id
    AND clicked_at >= NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN click_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get total clicks for user
CREATE OR REPLACE FUNCTION get_user_total_clicks(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    total_clicks INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_clicks
    FROM link_clicks lc
    JOIN links l ON lc.link_id = l.id
    WHERE l.user_id = p_user_id
    AND lc.clicked_at >= NOW() - (p_days || ' days')::INTERVAL;
    
    RETURN total_clicks;
END;
$$ LANGUAGE plpgsql;

-- Function to get clicks per link for user
CREATE OR REPLACE FUNCTION get_user_clicks_per_link(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    link_id UUID,
    link_title TEXT,
    click_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        COUNT(lc.id) as click_count
    FROM links l
    LEFT JOIN link_clicks lc ON l.id = lc.link_id 
        AND lc.clicked_at >= NOW() - (p_days || ' days')::INTERVAL
    WHERE l.user_id = p_user_id
    GROUP BY l.id, l.title
    ORDER BY click_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PREMIUM THEMES (Insert default themes)
-- ============================================

-- Create a table for themes
CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    colors JSONB NOT NULL,
    font TEXT DEFAULT 'dm-sans',
    preview_image TEXT
);

-- Insert free themes
INSERT INTO themes (id, name, is_premium, colors, font) VALUES
('default', 'Default', FALSE, '{"primary": "#0f172a", "secondary": "#334155", "background": "#ffffff", "accent": "#10b981"}', 'dm-sans'),
('dark', 'Dark Mode', FALSE, '{"primary": "#ffffff", "secondary": "#94a3b8", "background": "#0f172a", "accent": "#10b981"}', 'dm-sans')
ON CONFLICT (id) DO NOTHING;

-- Insert premium themes
INSERT INTO themes (id, name, is_premium, colors, font) VALUES
('ocean', 'Ocean Blue', TRUE, '{"primary": "#0c4a6e", "secondary": "#0369a1", "background": "#f0f9ff", "accent": "#0ea5e9"}', 'dm-sans'),
('sunset', 'Sunset', TRUE, '{"primary": "#7c2d12", "secondary": "#c2410c", "background": "#fff7ed", "accent": "#f97316"}', 'dm-serif'),
('forest', 'Forest Green', TRUE, '{"primary": "#14532d", "secondary": "#15803d", "background": "#f0fdf4", "accent": "#22c55e"}', 'dm-sans'),
('purple', 'Royal Purple', TRUE, '{"primary": "#581c87", "secondary": "#7c3aed", "background": "#faf5ff", "accent": "#a855f7"}', 'dm-serif'),
('midnight', 'Midnight', TRUE, '{"primary": "#e2e8f0", "secondary": "#94a3b8", "background": "#020617", "accent": "#6366f1"}', 'dm-sans'),
('rose', 'Rose Gold', TRUE, '{"primary": "#881337", "secondary": "#e11d48", "background": "#fff1f2", "accent": "#fb7185"}', 'dm-serif'),
('cyber', 'Cyberpunk', TRUE, '{"primary": "#fef08a", "secondary": "#a3e635", "background": "#1a1a1a", "accent": "#00ff00"}', 'dm-sans'),
('minimal', 'Minimalist', TRUE, '{"primary": "#171717", "secondary": "#525252", "background": "#fafafa", "accent": "#171717"}', 'dm-sans')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Themes are viewable by everyone" 
    ON themes FOR SELECT 
    USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update trigger for subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at_trigger
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Create subscription record when new user signs up
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'inactive')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create free subscription on profile creation
CREATE TRIGGER create_subscription_on_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_free_subscription();

-- ============================================
-- EXISTING USERS MIGRATION
-- Create subscription records for existing users
-- ============================================
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'inactive'
FROM profiles
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUBSCRIPTION LIMITS CONSTANTS
-- ============================================
-- Free plan: 5 links max
-- Premium plan: Unlimited links
-- These are enforced in application code

-- Add comment for documentation
COMMENT ON TABLE subscriptions IS 'Tracks Stripe subscription status for each user. Updated via webhooks.';
COMMENT ON TABLE link_clicks IS 'Analytics table tracking all link clicks. Premium feature.';
COMMENT ON TABLE themes IS 'Available themes. is_premium=true requires active subscription.';
COMMENT ON COLUMN profiles.is_premium IS 'Cached subscription status, updated via webhook';
COMMENT ON COLUMN profiles.custom_slug IS 'Custom URL slug for premium users (e.g., /custom-name)';
