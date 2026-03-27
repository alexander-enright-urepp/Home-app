'use client';

import { useState } from 'react';
import { Check, Palette, Lock } from 'lucide-react';
import { useSubscription } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// PREMIUM FEATURE: Theme selector with premium themes
// Free users: 2 themes (default, dark)
// Premium users: 10 themes

// Theme definitions
const THEMES = [
  // Free themes
  {
    id: 'default',
    name: 'Default',
    isPremium: false,
    colors: { primary: '#0f172a', secondary: '#334155', background: '#ffffff', accent: '#10b981' },
    preview: 'bg-slate-50',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    isPremium: false,
    colors: { primary: '#ffffff', secondary: '#94a3b8', background: '#0f172a', accent: '#10b981' },
    preview: 'bg-slate-900',
  },
  // Premium themes
  {
    id: 'ocean',
    name: 'Ocean',
    isPremium: true,
    colors: { primary: '#0c4a6e', secondary: '#0369a1', background: '#f0f9ff', accent: '#0ea5e9' },
    preview: 'bg-sky-50',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    isPremium: true,
    colors: { primary: '#7c2d12', secondary: '#c2410c', background: '#fff7ed', accent: '#f97316' },
    preview: 'bg-orange-50',
  },
  {
    id: 'forest',
    name: 'Forest',
    isPremium: true,
    colors: { primary: '#14532d', secondary: '#15803d', background: '#f0fdf4', accent: '#22c55e' },
    preview: 'bg-green-50',
  },
  {
    id: 'purple',
    name: 'Royal',
    isPremium: true,
    colors: { primary: '#581c87', secondary: '#7c3aed', background: '#faf5ff', accent: '#a855f7' },
    preview: 'bg-purple-50',
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    isPremium: true,
    colors: { primary: '#881337', secondary: '#e11d48', background: '#fff1f2', accent: '#fb7185' },
    preview: 'bg-rose-50',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    isPremium: true,
    colors: { primary: '#e2e8f0', secondary: '#94a3b8', background: '#020617', accent: '#6366f1' },
    preview: 'bg-slate-950',
  },
];

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { isPremium } = useSubscription();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleThemeSelect = async (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    
    if (!theme) return;

    // PREMIUM GATE: Check if theme requires premium
    if (theme.isPremium && !isPremium) {
      toast.error('Upgrade to Premium to unlock this theme');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Update theme in database AND clear custom colors (use theme colors)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          theme_preference: themeId,
          custom_colors: null // Clear custom colors to use theme colors
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      onThemeChange(themeId);
      toast.success(`Theme updated to ${theme.name}`);
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-emerald-500" />
        <h3 className="font-semibold text-slate-900">Choose Theme</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEMES.map((theme) => {
          const isLocked = theme.isPremium && !isPremium;
          const isSelected = currentTheme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              disabled={isUpdating}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${isLocked ? 'opacity-75' : ''}`}
            >
              {/* Theme preview */}
              <div
                className={`h-12 rounded-lg mb-3 ${theme.preview}`}
                style={{
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.secondary}`,
                }}
              >
                <div
                  className="h-3 w-16 rounded mx-auto mt-2"
                  style={{ background: theme.colors.accent }}
                />
              </div>

              {/* Theme name */}
              <p className="text-sm font-medium text-slate-900">{theme.name}</p>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Premium lock indicator */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl"
                >
                  <div className="bg-amber-100 rounded-full p-2"
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Premium indicator */}
      {!isPremium && (
        <p className="text-sm text-slate-500">
          <span className="font-medium">6 more themes</span> available with Premium
        </p>
      )}
    </div>
  );
}

// Apply theme to page
export function getThemeStyles(themeId: string) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  
  return {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    '--primary-color': theme.colors.primary,
    '--secondary-color': theme.colors.secondary,
    '--accent-color': theme.colors.accent,
    '--background-color': theme.colors.background,
  } as React.CSSProperties;
}
