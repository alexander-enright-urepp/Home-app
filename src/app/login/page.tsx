"use client";

import { useState, useEffect } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Tab = "login" | "signup";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showUsernameStep, setShowUsernameStep] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (shouldRedirect) {
      console.log("Effect triggered, navigating to dashboard");
      // Force full page reload to ensure cookies are synced
      window.location.href = "/dashboard";
    }
  }, [shouldRedirect]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-z0-9-]+$/;
    return usernameRegex.test(username) && username.length >= 3;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");
    setErrors({});

    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    console.log("Attempting login...");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrors({ general: "Invalid email or password" });
      setIsLoading(false);
      return;
    }

    if (data.session) {
      console.log("Login successful, session exists:", data.session.user.email);
      toast.success("Welcome back!");
      // Trigger navigation via effect
      console.log("Setting shouldRedirect to true");
      setShouldRedirect(true);
    } else {
      console.log("No session after login");
      setErrors({ general: "Login failed - no session created" });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    // Sign up WITHOUT email confirmation required
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          email_confirmed: true // Auto-confirm for better UX
        }
      }
    });

    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Store email/password temporarily for auto-login after username creation
      setPendingSignup({ email, password });
      setShowUsernameStep(true);
      setIsLoading(false);
      toast.success("Account created! Please choose a username.");
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateUsername(username)) {
      setErrors({
        username: "Username must be 3+ characters, lowercase letters, numbers, or hyphens only",
      });
      return;
    }

    setIsLoading(true);
    
    // Check if username exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      setErrors({ username: "This username is already taken" });
      setIsLoading(false);
      return;
    }

    // Get current user (should be logged in from signup)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If not logged in, try to auto-login with pending credentials
      if (pendingSignup) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: pendingSignup.email,
          password: pendingSignup.password,
        });
        
        if (signInError) {
          setErrors({ general: "Session expired. Please sign up again." });
          setIsLoading(false);
          setShowUsernameStep(false);
          return;
        }
        
        // Get user after login
        const { data: { user: loggedInUser } } = await supabase.auth.getUser();
        if (!loggedInUser) {
          setErrors({ general: "Login failed. Please try again." });
          setIsLoading(false);
          return;
        }
        
        // Create profile with logged in user
        const { error } = await supabase.from("profiles").insert({
          id: loggedInUser.id,
          username,
        });

        if (error) {
          console.error("Profile insert error:", error);
          setErrors({ general: "Failed to create profile. Please try again." });
          setIsLoading(false);
          return;
        }

        toast.success("Welcome to Home!");
        setShouldRedirect(true);
        return;
      }
      
      setErrors({ general: "User not found. Please try signing up again." });
      setIsLoading(false);
      return;
    }

    // Create profile with current user
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
    });

    if (error) {
      console.error("Profile insert error:", error);
      setErrors({ general: "Failed to create profile. Please try again." });
      setIsLoading(false);
      return;
    }

    toast.success("Welcome to Home!");
    setShouldRedirect(true);
  };

  if (showUsernameStep) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-display text-center mb-2">Choose your username</h1>
          <p className="text-center text-slate-500 mb-8">This will be your profile URL: home.app/@{username || 'username'}</p>
          
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="yourusername"
                  autoFocus
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {errors.general && (
              <p className="text-sm text-red-500">{errors.general}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
            
            <p className="text-xs text-slate-400 text-center mt-4">
              You can verify your email later from your profile settings
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-display text-center mb-8">Home</h1>

        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrors({});
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              activeTab === "login"
                ? "text-brand border-b-2 border-brand"
                : "text-muted hover:text-brand"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrors({});
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              activeTab === "signup"
                ? "text-brand border-b-2 border-brand"
                : "text-muted hover:text-brand"
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500">{errors.general}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500">{errors.general}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
