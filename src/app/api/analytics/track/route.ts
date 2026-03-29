import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PREMIUM FEATURE: Track link clicks for analytics
// Called when a visitor clicks a link on a public profile
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { link_id, user_id } = await request.json();

    if (!link_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get request metadata for analytics
    const referrer = request.headers.get('referer') || null;
    const userAgent = request.headers.get('user-agent') || null;
    
    // Get IP and country (in production, use a service like Vercel Analytics or ip-api)
    const ip = request.ip || request.headers.get('x-forwarded-for') || null;
    
    // Insert click record
    const { error } = await supabase.from('link_clicks').insert({
      link_id,
      user_id,
      referrer,
      user_agent: userAgent,
      ip_address: ip,
    });

    if (error) {
      console.error('Error tracking click:', error);
      // Don't fail the request - analytics shouldn't break the user experience
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track endpoint:', error);
    // Don't fail the request
    return NextResponse.json({ success: true });
  }
}
