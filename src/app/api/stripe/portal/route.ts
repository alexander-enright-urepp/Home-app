import { NextRequest, NextResponse } from 'next/server';
import { stripe, BASE_URL } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Create Stripe Customer Portal session
export async function POST(request: NextRequest) {
  try {
    // Get userId from request body (client-side auth)
    let userId: string | null = null;
    try {
      const body = await request.json();
      userId = body.userId;
    } catch (e) {
      console.log('No body in portal request');
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // MOCK MODE: Check for mock mode
    const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';
    
    if (isMockMode) {
      console.log('MOCK MODE: Opening portal for user:', userId);
      // Return flag for mock cancellation
      return NextResponse.json({ 
        mock: true,
        url: '/dashboard?tab=subscription&mock=cancel' 
      });
    }

    // Get customer's Stripe ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
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
