'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check for password reset token
  useEffect(() => {
    const checkForResetToken = () => {
      const hash = window.location.hash;
      console.log('Checking URL hash:', hash);
      if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
        console.log('Reset token detected, showing reset form');
        setShowResetPassword(true);
      }
    };
    
    // Check immediately
    checkForResetToken();
    
    // Also check when hash changes
    window.addEventListener('hashchange', checkForResetToken);
    return () => window.removeEventListener('hashchange', checkForResetToken);
  }, []);

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    // Check if has profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single();
    
    if (profile?.username) {
      router.push('/dashboard');
    } else {
      setShowUsername(true);
      setLoading(false);
    }
  };

  // SIGN UP
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Auto-sign in after signup
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (signInError) {
      setError('Account created but sign-in failed. Please log in.');
      setLoading(false);
      return;
    }

    setShowUsername(true);
    setLoading(false);
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    toast.success('Password reset email sent! Check your inbox.');
    setShowForgotPassword(false);
    setLoading(false);
  };

  // SAVE USERNAME
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    // INSERT new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: '',
        bio: '',
        is_premium: false,
      });

    if (insertError) {
      // If unique violation, profile already exists - try UPDATE instead
      if (insertError.code === '23505') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username: username.toLowerCase() })
          .eq('id', user.id);
        
        if (updateError) {
          setError('Failed: ' + updateError.message);
          setLoading(false);
          return;
        }
      } else {
        setError('Failed: ' + insertError.message);
        setLoading(false);
        return;
      }
    }

    toast.success('Welcome!');
    router.push('/dashboard');
  };

  // FORGOT PASSWORD SCREEN
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Enter your email and we'll send you a reset link</p>
          </div>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Email address"
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RESET PASSWORD SCREEN (from email link)
  if (showResetPassword) {
    const handleResetPassword = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      
      toast.success('Password updated! Please sign in with your new password.');
      setShowResetPassword(false);
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
            <p className="text-slate-400">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
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

  // USERNAME SCREEN
  if (showUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Choose Username</h1>
            <p className="text-slate-400">Your profile: aylae.app/@{username}</p>
          </div>
          
          <form onSubmit={handleSaveUsername} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full pl-10 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="username"
                minLength={3}
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGIN/SIGNUP SCREEN
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
        
        {/* Tab Switcher */}
        <div className="bg-slate-800/50 p-1 rounded-xl mb-8">
          <div className="flex">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-center font-medium rounded-lg transition-all ${
                isLogin 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-center font-medium rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Email address"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Password"
              minLength={6}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Forgot Password Link */}
        {isLogin && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          By {isLogin ? 'signing in' : 'signing up'}, you agree to our{' '}
          <Link href="#" className="text-emerald-400 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="text-emerald-400 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
