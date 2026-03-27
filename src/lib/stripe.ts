import Stripe from 'stripe';

// PREMIUM FEATURE: Stripe configuration
// Only initialize if not in mock mode and keys are present

const isMockMode = process.env.MOCK_STRIPE === 'true' || process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';

// Initialize Stripe with secret key (only if not in mock mode)
export const stripe = isMockMode 
  ? null as unknown as Stripe // Dummy for mock mode
  : new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
      apiVersion: '2024-12-18.acacia',
    });

// Price ID for the premium plan
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

// Webhook secret for verifying Stripe webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Base URL for redirects
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// PREMIUM GATE: Maximum links for free users
export const FREE_LINK_LIMIT = 5;

// PREMIUM GATE: Free themes available to all users
export const FREE_THEMES = ['default', 'dark'];

// Check if user has active subscription
export function isSubscriptionActive(status: string | null): boolean {
  return status === 'active' || status === 'trialing';
}

// Get plan name based on subscription status
export function getPlanName(isPremium: boolean): string {
  return isPremium ? 'Premium' : 'Free';
}
