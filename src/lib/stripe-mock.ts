// Home App - Mock Stripe for Development
// Use this when you don't have a real Stripe account set up
// Set NEXT_PUBLIC_MOCK_STRIPE=true in .env.local to enable

export const MOCK_STRIPE_ENABLED = process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';

// Mock checkout session
export function createMockCheckoutSession(userId: string) {
  return {
    url: `/checkout/mock?user_id=${userId}`,
    id: `mock_session_${Date.now()}`,
  };
}

// Mock customer portal
export function createMockPortalSession() {
  return {
    url: '/dashboard?tab=subscription&mock=cancel',
    id: `mock_portal_${Date.now()}`,
  };
}

// Mock webhook payload for subscription created
export function createMockSubscriptionPayload(userId: string) {
  return {
    id: `mock_sub_${Date.now()}`,
    object: 'subscription',
    status: 'active',
    customer: `mock_cust_${userId.slice(0, 8)}`,
    metadata: { user_id: userId },
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
    cancel_at_period_end: false,
  };
}

// Simulate activating premium for a user (use in webhook or directly)
export async function mockActivatePremium(userId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Create mock subscription record
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: `mock_cust_${userId.slice(0, 8)}`,
    stripe_subscription_id: `mock_sub_${Date.now()}`,
    status: 'active',
    plan: 'premium',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  });

  // Update profile
  await supabase
    .from('profiles')
    .update({ is_premium: true })
    .eq('id', userId);

  return { success: true };
}

// Simulate canceling premium
export async function mockCancelPremium(userId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      plan: 'free',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  await supabase
    .from('profiles')
    .update({ is_premium: false })
    .eq('id', userId);

  return { success: true };
}
