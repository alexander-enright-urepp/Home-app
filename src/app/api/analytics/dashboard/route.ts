import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Fetch analytics data for dashboard
// Returns click statistics for the authenticated user's links
export async function GET(request: NextRequest) {
  try {
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

    // Fetch clicks per link using RPC function
    const { data: linkClicks, error: linkError } = await supabase.rpc(
      'get_user_clicks_per_link',
      { p_user_id: user.id, p_days: days }
    );

    if (linkError) {
      console.error('Error fetching link clicks:', linkError);
    }

    // Fetch total clicks using RPC function
    const { data: totalClicks, error: totalError } = await supabase.rpc(
      'get_user_total_clicks',
      { p_user_id: user.id, p_days: days }
    );

    if (totalError) {
      console.error('Error fetching total clicks:', totalError);
    }

    // Fetch daily click breakdown (last 30 days)
    const { data: dailyClicks, error: dailyError } = await supabase
      .from('link_clicks')
      .select('clicked_at, links!inner(user_id)')
      .eq('links.user_id', user.id)
      .gte('clicked_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('clicked_at', { ascending: true });

    if (dailyError) {
      console.error('Error fetching daily clicks:', dailyError);
    }

    // Aggregate daily clicks
    const dailyStats: Record<string, number> = {};
    dailyClicks?.forEach((click) => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Get top performing links
    const topLinks = linkClicks?.slice(0, 5) || [];

    return NextResponse.json({
      totalClicks: totalClicks || 0,
      clicksPerLink: linkClicks || [],
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
