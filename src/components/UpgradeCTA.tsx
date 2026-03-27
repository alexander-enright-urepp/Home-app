'use client';

import { Sparkles, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// PREMIUM FEATURE: Upgrade CTA component
// Shows in free plan where premium features exist
interface UpgradeCTAProps {
  title?: string;
  description?: string;
  feature?: string;
  size?: 'small' | 'medium' | 'large';
}

export function UpgradeCTA({
  title = 'Upgrade to Premium',
  description = 'Unlock unlimited links, analytics, and custom themes',
  feature = 'this feature',
  size = 'medium',
}: UpgradeCTAProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Size variants
  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4',
    large: 'p-6',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl`}
    >
      <div className="flex items-start gap-3">
        <div className="bg-emerald-500 rounded-full p-2 flex-shrink-0">
          {size === 'small' ? (
            <Lock className="w-3 h-3 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {size !== 'small' && (
            <>
              <h4 className="font-semibold text-emerald-900 mb-1">{title}</h4>
              <p className="text-emerald-700 text-sm mb-3">{description}</p>
            </>
          )}
          
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : size === 'small' ? (
              `Unlock ${feature}`
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade Now — $5/month
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// PREMIUM FEATURE: Locked feature placeholder
// Shows when free user tries to access premium feature
export function LockedFeature({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {feature} is a Premium Feature
      </h3>
      <p className="text-slate-600 mb-6 max-w-sm">
        Upgrade to Premium to unlock {feature.toLowerCase()} and more powerful features
      </p>
      <UpgradeCTA size="medium" />
    </div>
  );
}

// PREMIUM FEATURE: Premium badge
// Shows on dashboard when user has active subscription
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
      <Sparkles className="w-3 h-3" />
      PREMIUM
    </span>
  );
}

// PREMIUM FEATURE: Link limit indicator
// Shows free users how many links they have left
export function LinkLimitIndicator({ 
  current, 
  max, 
  isPremium 
}: { 
  current: number; 
  max: number; 
  isPremium: boolean;
}) {
  if (isPremium) {
    return (
      <span className="text-sm text-emerald-600 font-medium">
        Unlimited links
      </span>
    );
  }

  const remaining = max - current;
  const isNearLimit = remaining <= 1;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${isNearLimit ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
        {current}/{max} links used
      </span>
      {isNearLimit && remaining > 0 && (
        <span className="text-xs text-amber-600">
          ({remaining} remaining)
        </span>
      )}
      {remaining === 0 && (
        <span className="text-xs text-red-600 font-medium">
          Limit reached
        </span>
      )}
    </div>
  );
}
