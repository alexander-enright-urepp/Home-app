'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, XCircle, Calendar, ExternalLink, Sparkles, Wrench } from 'lucide-react';
import { useSubscription } from '@/lib/subscription';
import { PremiumBadge, UpgradeCTA } from './UpgradeCTA';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function SubscriptionManager() {
  const { subscription, isPremium, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsMockMode(process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true');
    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleManageSubscription = async () => {
    if (!userId) {
      toast.error('Please sign in');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      
      // If mock mode, handle cancellation directly
      if (data.mock) {
        handleMockCancel();
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
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

  // Cancel subscription (mock or real)
  const handleCancelSubscription = async () => {
    if (!userId) {
      toast.error('Please sign in');
      return;
    }
    
    if (!confirm('Are you sure you want to cancel your Premium subscription?\n\nYou will lose access to:\n• Unlimited links\n• Custom themes\n• Analytics\n• Custom colors & fonts')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update subscription to canceled
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'canceled',
          plan: 'free',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Update profile
      await supabase
        .from('profiles')
        .update({ 
          is_premium: false,
          custom_colors: null,
          custom_font: 'dm-sans',
          remove_branding: false,
        })
        .eq('id', userId);

      toast.success('Subscription canceled. Reverting to Free plan.');
      refreshSubscription();
      
      // Force page refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error canceling:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock mode cancel handler
  const handleMockCancel = async () => {
    if (!confirm('Cancel your Premium subscription? (This is a test)')) return;
    await handleCancelSubscription();
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

  const isCanceled = subscription?.cancel_at_period_end;
  const statusColor = subscription?.status === 'active' 
    ? 'bg-emerald-100 text-emerald-800' 
    : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
        {isMockMode && (
          <div className="bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Mock Mode Active</span>
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
                You'll revert to the Free plan.
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

        {/* Cancel Subscription Button */}
        <button
          onClick={handleCancelSubscription}
          disabled={isLoading || isCanceled}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Canceling...
            </>
          ) : isCanceled ? (
            'Cancellation Scheduled'
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Cancel Subscription
            </>
          )}
        </button>
      </div>

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
