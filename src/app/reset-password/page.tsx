'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Wait for Supabase to process any hash params
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Recovery session established');
          setHasSession(true);
        } else {
          // Try to exchange the hash token if present
          const hash = window.location.hash;
          if (hash && hash.length > 1) {
            // Supabase should have auto-processed it
            // Check again after a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            
            if (retrySession) {
              setHasSession(true);
            } else {
              setError('Invalid or expired link. Please request a new password reset.');
            }
          } else {
            setError('No reset token found. Please request a new password reset.');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsValidating(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    
    // Sign out after 3 seconds and redirect to login
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push('/login');
    }, 3000);
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Invalid</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Password Updated!</h1>
          <p className="text-slate-400 mb-6">Your password has been reset successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Aylae
          </h1>
          <p className="text-slate-400">All Your Links, Accessed Easily</p>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-slate-400">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="New password"
              minLength={6}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Confirm new password"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
