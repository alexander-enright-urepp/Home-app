'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// MOCK CHECKOUT PAGE
export default function MockCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isActivating, setIsActivating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const userId = searchParams.get('user_id');

  const isMockMode = process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';

  const activatePremium = async () => {
    if (!userId) {
      toast.error('No user ID found');
      return;
    }

    setIsActivating(true);
    
    try {
      // First check if subscription exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      const subId = `mock_sub_${Date.now()}`;
      
      if (existingSub) {
        // Update existing subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            stripe_customer_id: `mock_cust_${userId.slice(0, 8)}`,
            stripe_subscription_id: subId,
            status: 'active',
            plan: 'premium',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (subError) throw subError;
      } else {
        // Insert new subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: `mock_cust_${userId.slice(0, 8)}`,
            stripe_subscription_id: subId,
            status: 'active',
            plan: 'premium',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
          });

        if (subError) throw subError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId);

      if (profileError) throw profileError;

      setIsComplete(true);
      toast.success('Premium activated!');
      
      setTimeout(() => {
        router.push('/dashboard?checkout=success');
      }, 2000);
    } catch (error) {
      console.error('Error activating premium:', error);
      toast.error('Failed to activate premium: ' + (error as Error).message);
    } finally {
      setIsActivating(false);
    }
  };

  if (!isMockMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Mock Mode Disabled</h1>
          <p className="text-slate-600">Set NEXT_PUBLIC_MOCK_STRIPE=true</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Error</h1>
          <p className="text-slate-600">No user ID found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {isComplete ? (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Premium!</h1>
            <p className="text-slate-600 mb-6">Your subscription is now active.</p>
            <div className="flex justify-center gap-2 text-sm text-emerald-600">
              <Sparkles className="w-4 h-4" />
              <span>Premium features unlocked</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Mock Checkout</h1>
            <p className="text-slate-600 mb-6">No real payment will be processed.</p>
            
            <button
              onClick={activatePremium}
              disabled={isActivating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isActivating ? 'Activating...' : (
                <>Activate Premium (Free) <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
