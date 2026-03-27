import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// PREMIUM FEATURE: Create Stripe Checkout session
// Called when user clicks "Upgrade to Premium"
export async function POST(request: NextRequest) {
  try {
    console.log('Checkout API called');
    
    // Check MOCK MODE first (before any auth)
    const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';
    console.log('Is mock mode:', isMockMode);
    
    // Create Supabase client for route handler
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    // MOCK MODE: Return mock checkout URL immediately
    if (isMockMode) {
      console.log('MOCK MODE: Redirecting to mock checkout');
      return NextResponse.json({ 
        url: `/checkout/mock?user_id=${user.id}` 
      });
    }

    // REAL STRIPE MODE
    const { stripe, STRIPE_PRICE_ID, BASE_URL } = await import('@/lib/stripe');
    
    if (!STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe not configured. Set MOCK_STRIPE=true for testing.' },
        { status: 500 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    // Create Stripe customer
    let customerId: string | null = null;
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          user_id: user.id,
          username: profile?.username || '',
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: `${BASE_URL}/dashboard?checkout=success`,
      cancel_url: `${BASE_URL}/dashboard?checkout=canceled`,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: (error as Error).message },
      { status: 500 }
    );
  }
}
