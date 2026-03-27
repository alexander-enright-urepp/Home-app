import { NextRequest, NextResponse } from 'next/server';
import { stripe, BASE_URL } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Create Stripe Customer Portal session
// Allows users to manage their subscription (cancel, update payment, etc.)
// MOCK MODE: Set MOCK_STRIPE=true in .env.local to test
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

    // MOCK MODE: Check for mock mode
    const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';
    
    if (isMockMode) {
      console.log('MOCK MODE: Opening portal for user:', user.id);
      // Redirect to dashboard with mock flag
      return NextResponse.json({ 
        url: '/dashboard?tab=subscription&mock=cancel' 
      });
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
