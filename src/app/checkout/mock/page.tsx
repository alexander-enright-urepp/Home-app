'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_STRIPE_ENABLED, mockActivatePremium } from '@/lib/stripe-mock';
import toast from 'react-hot-toast';

// MOCK CHECKOUT PAGE
// This page handles "fake" checkout success for development
// Set NEXT_PUBLIC_MOCK_STRIPE=true in .env.local to use this
export default function MockCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isActivating, setIsActivating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('user_id');
    
    if (userId && MOCK_STRIPE_ENABLED) {
      activatePremium(userId);
    }
  }, [searchParams]);

  const activatePremium = async (userId: string) => {
    setIsActivating(true);
    
    try {
      // Activate premium in database
      const result = await mockActivatePremium(userId);
      
      if (result.success) {
        setIsComplete(true);
        toast.success('Premium activated!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard?checkout=success');
        }, 2000);
      }
    } catch (error) {
      console.error('Error activating premium:', error);
      toast.error('Failed to activate premium');
    } finally {
      setIsActivating(false);
    }
  };

  if (!MOCK_STRIPE_ENABLED) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Mock Mode Disabled</h1>
          <p className="text-slate-600">
            Set NEXT_PUBLIC_MOCK_STRIPE=true to use mock checkout
          </p>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-slate-600 mb-6">
              Your subscription is now active. Redirecting to dashboard...
            </p>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Mock Checkout
            </h1>
            <p className="text-slate-600 mb-6">
              This is a test checkout. No real payment will be processed.
            </p>
            
            <button
              onClick={() => {
                const userId = searchParams.get('user_id');
                if (userId) activatePremium(userId);
              }}
              disabled={isActivating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isActivating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Activating...
                </>
              ) : (
                <>
                  Activate Premium (Free)
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-slate-400">
              This is development mode. Set up real Stripe for production.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
