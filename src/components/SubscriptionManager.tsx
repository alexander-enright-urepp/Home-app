'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, XCircle, Calendar, ExternalLink, Sparkles, Wrench } from 'lucide-react';
import { useSubscription } from '@/lib/subscription';
import { PremiumBadge, UpgradeCTA } from './UpgradeCTA';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// PREMIUM FEATURE: Subscription management panel
// Shows current plan status and allows managing subscription
// MOCK MODE: Shows test indicator when MOCK_STRIPE=true
export function SubscriptionManager() {
  const { subscription, isPremium, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  // Check if mock mode is enabled (client-side)
  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true');
  }, []);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  // MOCK MODE: Handle mock cancellation
  const handleMockCancel = async () => {
    if (!confirm('Cancel your Premium subscription? (This is a test)')) return;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update subscription to canceled status
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          plan: 'free',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', user.id);

      toast.success('Subscription canceled (mock)');
      refreshSubscription();
    } catch (error) {
      console.error('Error canceling:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show upgrade CTA for free users
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-200 rounded-full p-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Current Plan</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                Free
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>1 page</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Up to 5 links</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>2 basic themes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>No analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Home branding shown</span>
            </div>
          </div>

          <UpgradeCTA size="large" />
        </div>
      </div>
    );
  }

  // Show premium subscription details
  const isCanceled = subscription?.cancel_at_period_end;
  const statusColor = subscription?.status === 'active' 
    ? 'bg-emerald-100 text-emerald-800' 
    : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
        {/* MOCK MODE INDICATOR */}
        {isMockMode && (
          <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Mock Mode Active — No real payments processed
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 rounded-full p-2">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Current Plan</h3>
              <div className="flex items-center gap-2 mt-1">
                <PremiumBadge />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {subscription?.status === 'active' ? 'Active' : subscription?.status}
                </span>
                {isMockMode && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    TEST
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">$5</p>
            <p className="text-sm text-slate-600">/month</p>
          </div>
        </div>

        {isCanceled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Subscription ending</p>
              <p className="text-amber-700">
                Your subscription will end on {formatDate(subscription?.current_period_end)}. 
                You'll revert to the Free plan after that.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Current period ends
            </span>
            <span className="font-medium text-slate-900">
              {formatDate(subscription?.current_period_end)}
            </span>
          </div>
        </div>

        {/* MOCK MODE: Show cancel button instead of portal */}
        {isMockMode ? (
          <button
            onClick={handleMockCancel}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Canceling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Cancel Subscription (Test)
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Manage Subscription
              </>
            )}
          </button>
        )}
      </div>

      {/* Premium features list */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Your Premium Features</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Unlimited links',
            'Custom themes',
            'Analytics dashboard',
            'Custom colors & fonts',
            'Remove Home branding',
            'Custom page URL',
            'Priority support',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
