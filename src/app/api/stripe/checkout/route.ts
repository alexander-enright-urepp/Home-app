import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_ID, BASE_URL } from '@/lib/stripe';
import { MOCK_STRIPE_ENABLED, createMockCheckoutSession } from '@/lib/stripe-mock';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Create Stripe Checkout session
// Called when user clicks "Upgrade to Premium"
// MOCK MODE: Set NEXT_PUBLIC_MOCK_STRIPE=true to test without real Stripe
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // MOCK MODE: Return mock checkout URL
    if (MOCK_STRIPE_ENABLED) {
      console.log('Using MOCK Stripe checkout for user:', user.id);
      const mockSession = createMockCheckoutSession(user.id);
      return NextResponse.json({ url: mockSession.url });
    }

    // REAL STRIPE: Proceed with actual checkout
    if (!STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe not configured. Set NEXT_PUBLIC_MOCK_STRIPE=true for testing.' },
        { status: 500 }
      );
    }

    // Get user's profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', user.id)
      .single();

    // Create or retrieve Stripe customer
    let customerId: string | null = null;
    
    // Check if user already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
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
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${BASE_URL}/dashboard?checkout=success`,
      cancel_url: `${BASE_URL}/dashboard?checkout=canceled`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
