import Stripe from 'stripe';

// Initialize Stripe with secret key
// PREMIUM FEATURE: This is used for subscription management
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest API version
});

// Price ID for the premium plan
// Set this in your environment variables after creating the product in Stripe Dashboard
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

// Webhook secret for verifying Stripe webhook signatures
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Base URL for redirects
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// PREMIUM GATE: Maximum links for free users
export const FREE_LINK_LIMIT = 5;

// PREMIUM GATE: Free themes available to all users
export const FREE_THEMES = ['default', 'dark'];

// Check if user has active subscription
// Used throughout the app to gate premium features
export function isSubscriptionActive(status: string | null): boolean {
  return status === 'active' || status === 'trialing';
}

// Get plan name based on subscription status
export function getPlanName(isPremium: boolean): string {
  return isPremium ? 'Premium' : 'Free';
}
