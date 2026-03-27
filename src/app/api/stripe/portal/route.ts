import { NextRequest, NextResponse } from 'next/server';
import { stripe, BASE_URL } from '@/lib/stripe';
import { MOCK_STRIPE_ENABLED, createMockPortalSession } from '@/lib/stripe-mock';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Create Stripe Customer Portal session
// Allows users to manage their subscription (cancel, update payment, etc.)
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

    // MOCK MODE: Return mock portal URL
    if (MOCK_STRIPE_ENABLED) {
      console.log('Using MOCK Stripe portal for user:', user.id);
      const mockPortal = createMockPortalSession();
      return NextResponse.json({ url: mockPortal.url });
    }

    // Get customer's Stripe ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${BASE_URL}/dashboard?tab=subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
