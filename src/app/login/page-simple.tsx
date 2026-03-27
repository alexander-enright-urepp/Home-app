'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameStep, setShowUsernameStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;
  const validateUsername = (username: string) => /^[a-z0-9-]+$/.test(username) && username.length >= 3;

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: "Invalid email" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password required" });
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrors({ general: "Invalid login" });
      setIsLoading(false);
      return;
    }

    if (data.session?.user) {
      // Check if has profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.session.user.id)
        .single();
      
      if (profile) {
        // Has profile - go to dashboard
        router.push("/dashboard");
      } else {
        // No profile - need username
        setShowUsernameStep(true);
        setIsLoading(false);
      }
    }
  };

  // SIGN UP
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: "Invalid email" });
      return;
    }
    if (!validatePassword(password)) {
      setErrors({ password: "Password must be 6+ chars" });
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
      return;
    }

    if (data.user) {
      setShowUsernameStep(true);
      setIsLoading(false);
    }
  };

  // USERNAME STEP
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateUsername(username)) {
      setErrors({ username: "3+ chars, lowercase letters/numbers/hyphens only" });
      return;
    }

    setIsLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setErrors({ general: "Not logged in" });
      setIsLoading(false);
      return;
    }

    // Check if username taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setErrors({ username: "Username taken" });
      setIsLoading(false);
      return;
    }

    // Simple UPDATE - trigger creates profile
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      console.error("Update failed:", error);
      setErrors({ general: "Failed: " + error.message });
      setIsLoading(false);
      return;
    }

    // Success
    toast.success("Welcome!");
    router.push("/dashboard");
  };

  // RENDER USERNAME STEP
  if (showUsernameStep) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">Choose Username</h1>
          <p className="text-center text-gray-500 mb-8">home.app/@{username}</p>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="yourname"
                autoFocus
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            
            {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER LOGIN/SIGNUP
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">Home</h1>
        
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
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="you@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
