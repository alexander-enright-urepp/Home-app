import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// PREMIUM FEATURE: Fetch analytics data for dashboard
// Returns click statistics for the authenticated user's links
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Can't set cookies in GET handler
          },
          remove(name: string, options: any) {
            // Can't remove cookies in GET handler
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has premium via profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    // PREMIUM GATE: Check profile.is_premium
    if (!profile?.is_premium) {
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
    const { count: totalClicks, error: totalError } = await supabase
      .from('link_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('clicked_at', dateThreshold);

    if (totalError) {
      console.error('Error fetching total clicks:', totalError);
    }

    // Fetch clicks per link
    const { data: linkClicks, error: linkError } = await supabase
      .from('link_clicks')
      .select('link_id, links!inner(title)')
      .eq('user_id', user.id)
      .gte('clicked_at', dateThreshold);

    if (linkError) {
      console.error('Error fetching link clicks:', linkError);
    }

    // Aggregate clicks per link
    const clicksPerLinkMap = new Map();
    linkClicks?.forEach((click: any) => {
      const linkId = click.link_id;
      const title = click.links?.title || 'Unknown';
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

    if (dailyError) {
      console.error('Error fetching daily clicks:', dailyError);
    }

    // Aggregate daily clicks
    const dailyStats: Record<string, number> = {};
    dailyClicks?.forEach((click: any) => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // Get top performing links
    const topLinks = clicksPerLink.slice(0, 5);

    return NextResponse.json({
      totalClicks: totalClicks || 0,
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
