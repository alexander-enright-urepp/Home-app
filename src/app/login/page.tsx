'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

  // USERNAME SCREEN
  if (showUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">Choose Username</h1>
          <p className="text-center text-gray-500 mb-8">Your profile: ae-home-app.vercel.app/@{username}</p>
          
          <form onSubmit={handleSaveUsername} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="username"
              minLength={3}
              required
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGIN/SIGNUP SCREEN
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">Aylae</h1>
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center border-b-2 ${isLogin ? 'border-blue-600 text-blue-600' : 'border-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center border-b-2 ${!isLogin ? 'border-blue-600 text-blue-600' : 'border-gray-200'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Password"
            minLength={6}
            required
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
