'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

// PREMIUM FEATURE: Subscription status types
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'inactive';

// PREMIUM FEATURE: Subscription data structure
interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  plan: 'free' | 'premium';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

// PREMIUM FEATURE: Context type
interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  linkCount: number;
  maxLinks: number;
  canAddLink: boolean;
  hasPremiumFeature: (feature: string) => boolean;
}

// PREMIUM FEATURE: Free plan limits
const FREE_LINK_LIMIT = 5;

// Create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// PREMIUM FEATURE: Provider component that wraps the app
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCount, setLinkCount] = useState(0);

  // Fetch subscription and link count
  const fetchSubscriptionData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      // Fetch link count
      const { count, error: countError } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error fetching link count:', countError);
      }

      setSubscription(subData || {
        id: '',
        user_id: user.id,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: 'inactive',
        plan: 'free',
        current_period_end: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
      });
      
      setLinkCount(count || 0);
    } catch (error) {
      console.error('Error in subscription fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription on mount and auth changes
  useEffect(() => {
    fetchSubscriptionData();

    // Subscribe to auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscriptionData();
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // PREMIUM GATE: Determine if user has premium
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  // PREMIUM GATE: Max links based on plan
  const maxLinks = isPremium ? Infinity : FREE_LINK_LIMIT;

  // PREMIUM GATE: Can add more links?
  const canAddLink = isPremium || linkCount < FREE_LINK_LIMIT;

  // PREMIUM GATE: Check specific premium features
  const hasPremiumFeature = (feature: string): boolean => {
    const premiumFeatures = [
      'unlimited_links',
      'custom_themes',
      'analytics',
      'custom_colors',
      'custom_fonts',
      'remove_branding',
      'custom_slug',
      'reorder_links',
    ];
    
    return isPremium || !premiumFeatures.includes(feature);
  };

  const value: SubscriptionContextType = {
    subscription,
    isPremium,
    isLoading,
    refreshSubscription: fetchSubscriptionData,
    linkCount,
    maxLinks,
    canAddLink,
    hasPremiumFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// PREMIUM FEATURE: Hook to use subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
