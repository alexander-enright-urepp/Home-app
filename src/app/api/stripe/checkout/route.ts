import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe, STRIPE_PRICE_ID, BASE_URL } from '@/lib/stripe';

// PREMIUM FEATURE: Create Stripe Checkout session
// Called when user clicks "Upgrade to Premium"
// MOCK MODE: Set MOCK_STRIPE=true in .env.local to test
export async function POST(request: NextRequest) {
  try {
    console.log('Checkout API called');
    
    // Create Supabase client for route handler
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);
    console.log('Env check - MOCK_STRIPE:', process.env.MOCK_STRIPE);

    // MOCK MODE: Check for mock mode
    const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';
    
    console.log('Is mock mode:', isMockMode);
    
    if (isMockMode) {
      console.log('MOCK MODE: Redirecting to mock checkout');
      return NextResponse.json({ 
        url: `/checkout/mock?user_id=${user.id}` 
      });
    }

    // REAL STRIPE: Check if configured
    if (!STRIPE_PRICE_ID) {
      console.error('STRIPE_PRICE_ID not configured');
      return NextResponse.json(
        { error: 'Stripe not configured. Set MOCK_STRIPE=true for testing.' },
        { status: 500 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', user.id)
      .single();

    // Create or retrieve Stripe customer
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
        email: user.email || profile?.email,
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
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: (error as Error).message },
      { status: 500 }
    );
  }
}
