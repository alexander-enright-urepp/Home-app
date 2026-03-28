'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'inactive';

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

const FREE_LINK_LIMIT = 5;

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCount, setLinkCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      // Ensure session exists before querying
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session available for subscription fetch');
        setSubscription(null);
        setUserId(null);
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setUserId(null);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch profile to check is_premium flag
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      const isPremiumFromProfile = profileData?.is_premium || false;

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      console.log('Fetched subscription:', subData, 'Profile is_premium:', isPremiumFromProfile);

      // Fetch link count
      const { count, error: countError } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error fetching link count:', countError);
      }

      const newSub = subData || {
        id: '',
        user_id: user.id,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: isPremiumFromProfile ? 'active' : 'inactive',
        plan: isPremiumFromProfile ? 'premium' : 'free',
        current_period_end: null,
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
      };

      // If subscription exists but profile says premium, ensure status is active
      if (isPremiumFromProfile && newSub.status !== 'active') {
        newSub.status = 'active';
        newSub.plan = 'premium';
      }

      setSubscription(newSub);
      setLinkCount(count || 0);
      
      console.log('Subscription set, status:', newSub.status, 'isPremium:', newSub.status === 'active');
    } catch (error) {
      console.error('Error in subscription fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscriptionData();
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // Real-time subscription updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          fetchSubscriptionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';
  const maxLinks = isPremium ? Infinity : FREE_LINK_LIMIT;
  const canAddLink = isPremium || linkCount < FREE_LINK_LIMIT;

  const hasPremiumFeature = (feature: string): boolean => {
    const premiumFeatures = [
      'unlimited_links', 'custom_themes', 'analytics', 'custom_colors',
      'custom_fonts', 'remove_branding', 'custom_slug', 'reorder_links',
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

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
