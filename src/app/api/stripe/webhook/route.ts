import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { MOCK_STRIPE_ENABLED } from '@/lib/stripe-mock';
import { supabase } from '@/lib/supabase';

// PREMIUM FEATURE: Stripe webhook handler
// Receives events from Stripe when subscription status changes
// MOCK MODE: Set NEXT_PUBLIC_MOCK_STRIPE=true to skip webhook verification
export async function POST(request: NextRequest) {
  // MOCK MODE: Skip webhook processing entirely
  if (MOCK_STRIPE_ENABLED) {
    console.log('MOCK MODE: Webhook received but not processed (using direct activation instead)');
    return NextResponse.json({ received: true, mock: true });
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      // PREMIUM: Subscription created (checkout completed)
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Update database via RPC function
          await supabase.rpc('update_user_subscription', {
            p_user_id: userId,
            p_stripe_customer_id: customerId,
            p_stripe_subscription_id: subscriptionId,
            p_status: 'active',
            p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      // PREMIUM: Subscription updated
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          await supabase.rpc('update_user_subscription', {
            p_user_id: userId,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_subscription_id: subscription.id,
            p_status: subscription.status,
            p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
        }
        break;
      }

      // PREMIUM: Subscription deleted (canceled)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          await supabase.rpc('update_user_subscription', {
            p_user_id: userId,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_subscription_id: subscription.id,
            p_status: 'canceled',
            p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          console.log(`Subscription canceled for user ${userId}`);
        }
        break;
      }

      // PREMIUM: Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          // Get user from subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (sub?.user_id) {
            await supabase.rpc('update_user_subscription', {
              p_user_id: sub.user_id,
              p_stripe_customer_id: invoice.customer as string,
              p_stripe_subscription_id: subscriptionId,
              p_status: 'past_due',
              p_period_end: null,
            });

            console.log(`Payment failed for user ${sub.user_id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};
