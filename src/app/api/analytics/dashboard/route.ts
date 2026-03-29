import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PREMIUM FEATURE: Fetch analytics data for dashboard
// Returns click statistics for the authenticated user's links
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client that reads cookies
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has premium subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single();

    // Also check profile.is_premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    // PREMIUM GATE: Premium via subscription OR profile flag
    const isPremium = subscription?.status === 'active' || 
                     subscription?.status === 'trialing' ||
                     profile?.is_premium === true;

    if (!isPremium) {
      return NextResponse.json(
        { error: 'Premium feature' },
        { status: 403 }
      );
    }

    // Get query params for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date threshold
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch total clicks
    const { data: totalClicksData, error: totalError } = await supabase
      .from('link_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('clicked_at', dateThreshold);

    const totalClicks = totalClicksData?.length || 0;

    // Fetch clicks per link
    const { data: linkClicks, error: linkError } = await supabase
      .from('link_clicks')
      .select('link_id, links!inner(title)')
      .eq('user_id', user.id)
      .gte('clicked_at', dateThreshold);

    // Aggregate clicks per link
    const clicksPerLinkMap = new Map();
    linkClicks?.forEach((click) => {
      const linkId = click.link_id;
      const title = (click.links as any)?.title || 'Unknown';
      if (!clicksPerLinkMap.has(linkId)) {
        clicksPerLinkMap.set(linkId, { link_id: linkId, link_title: title, click_count: 0 });
      }
      clicksPerLinkMap.get(linkId).click_count++;
    });

    const clicksPerLink = Array.from(clicksPerLinkMap.values()).sort((a, b) => b.click_count - a.click_count);

    // Fetch daily click breakdown
    const { data: dailyClicks, error: dailyError } = await supabase
      .from('link_clicks')
      .select('clicked_at')
      .eq('user_id', user.id)
      .gte('clicked_at', dateThreshold)
      .order('clicked_at', { ascending: true });

    // Aggregate daily clicks
    const dailyStats: Record<string, number> = {};
    dailyClicks?.forEach((click) => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Get top performing links
    const topLinks = clicksPerLink.slice(0, 5);

    return NextResponse.json({
      totalClicks,
      clicksPerLink,
      dailyStats,
      topLinks,
      days,
    });
  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
