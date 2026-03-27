import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// PREMIUM FEATURE: Create Stripe Checkout session
export async function POST(request: NextRequest) {
  try {
    console.log('Checkout API called');
    
    // Get request body to check for userId (fallback for cookie auth issues)
    let userId: string | null = null;
    
    try {
      const body = await request.json();
      userId = body.userId;
      console.log('Got userId from body:', userId);
    } catch (e) {
      console.log('No body in request');
    }
    
    // Try to get user from cookies as well
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {},
          remove(name: string, options: any) {},
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use user from cookie if available, otherwise use body userId
    const finalUserId = user?.id || userId;
    
    if (!finalUserId) {
      console.error('No user found in cookies or body');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', finalUserId);

    // Check MOCK MODE
    const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';
    console.log('Is mock mode:', isMockMode);
    
    if (isMockMode) {
      console.log('MOCK MODE: Redirecting to mock checkout');
      return NextResponse.json({ 
        url: `/checkout/mock?user_id=${finalUserId}` 
      });
    }

    // REAL STRIPE MODE
    const { stripe, STRIPE_PRICE_ID, BASE_URL } = await import('@/lib/stripe');
    
    if (!STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: `${BASE_URL}/dashboard?checkout=success`,
      cancel_url: `${BASE_URL}/dashboard?checkout=canceled`,
      metadata: { user_id: finalUserId },
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
