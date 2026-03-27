"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { LinkCard } from "@/components/LinkCard";
import { SkeletonCard, SkeletonAvatar, SkeletonText } from "@/components/SkeletonCard";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  theme_preference: string;
  custom_colors: { primary?: string; secondary?: string; background?: string; accent?: string } | null;
  custom_font: string;
  remove_branding: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  icon: string | null;
  color: string | null;
  order: number;
}

interface PageProps {
  params: { username: string };
}

// PREMIUM FEATURE: Theme definitions
const THEMES: Record<string, { colors: { primary: string; secondary: string; background: string; accent: string } }> = {
  default: { colors: { primary: "#0f172a", secondary: "#334155", background: "#ffffff", accent: "#10b981" } },
  dark: { colors: { primary: "#ffffff", secondary: "#94a3b8", background: "#0f172a", accent: "#10b981" } },
  ocean: { colors: { primary: "#0c4a6e", secondary: "#0369a1", background: "#f0f9ff", accent: "#0ea5e9" } },
  sunset: { colors: { primary: "#7c2d12", secondary: "#c2410c", background: "#fff7ed", accent: "#f97316" } },
  forest: { colors: { primary: "#14532d", secondary: "#15803d", background: "#f0fdf4", accent: "#22c55e" } },
  purple: { colors: { primary: "#581c87", secondary: "#7c3aed", background: "#faf5ff", accent: "#a855f7" } },
  rose: { colors: { primary: "#881337", secondary: "#e11d48", background: "#fff1f2", accent: "#fb7185" } },
  midnight: { colors: { primary: "#e2e8f0", secondary: "#94a3b8", background: "#020617", accent: "#6366f1" } },
};

export default function PublicProfilePage({ params }: PageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile with premium fields
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name, bio, avatar_url, is_premium, theme_preference, custom_colors, custom_font, remove_branding")
          .eq("username", params.username)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch visible links
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("id, title, subtitle, url, icon, color, order")
          .eq("user_id", profileData.id)
          .eq("is_visible", true)
          .order("order", { ascending: true });

        if (linksError) {
          console.error("Error fetching links:", linksError);
        } else {
          setLinks(linksData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.username]);

  // PREMIUM FEATURE: Track link click
  const handleLinkClick = async (linkId: string) => {
    if (!profile) return;

    // Only track if premium user (analytics feature)
    if (profile.is_premium) {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            link_id: linkId,
            user_id: profile.id,
          }),
        });
      } catch (error) {
        // Silent fail - analytics shouldn't break UX
        console.error("Failed to track click:", error);
      }
    }
  };

  // PREMIUM FEATURE: Get theme styles
  const getThemeStyles = () => {
    if (!profile) return {};

    // Use custom colors if premium user has set them
    if (profile.is_premium && profile.custom_colors) {
      return {
        backgroundColor: profile.custom_colors.background || THEMES.default.colors.background,
        color: profile.custom_colors.primary || THEMES.default.colors.primary,
      };
    }

    // Otherwise use theme preset
    const theme = THEMES[profile.theme_preference] || THEMES.default;
    return {
      backgroundColor: theme.colors.background,
      color: theme.colors.primary,
    };
  };

  const getAccentColor = () => {
    if (!profile) return THEMES.default.colors.accent;
    
    if (profile.is_premium && profile.custom_colors?.accent) {
      return profile.custom_colors.accent;
    }
    
    const theme = THEMES[profile.theme_preference] || THEMES.default;
    return theme.colors.accent;
  };

  // Get secondary color for subtitle text
  const getTextColor = () => {
    if (!profile) return THEMES.default.colors.secondary;
    
    if (profile.is_premium && profile.custom_colors?.secondary) {
      return profile.custom_colors.secondary;
    }
    
    const theme = THEMES[profile.theme_preference] || THEMES.default;
    return theme.colors.secondary;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-12 px-4 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <SkeletonAvatar />
            <div className="mt-4 w-32">
              <SkeletonText lines={1} />
            </div>
            <div className="mt-2 w-48">
              <SkeletonText lines={1} />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">This page doesn&apos;t exist</h1>
          <p className="text-slate-500 mb-6">
            We couldn&apos;t find a Home page for @{params.username}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">Something went wrong</h1>
          <p className="text-slate-500 mb-6">Please try again later</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start pt-12 pb-6 px-4 transition-colors duration-300"
      style={getThemeStyles()}
    >
      <div className="w-full max-w-md">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar
            url={profile.avatar_url}
            alt={profile.display_name || profile.username}
            size={80}
          />
          <h1 
            className="mt-4 text-2xl font-display"
            style={{ color: getThemeStyles().color }}
          >
            {profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p 
              className="mt-1 text-sm text-center opacity-80"
              style={{ color: getThemeStyles().color }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3 w-full">
          {links.length === 0 ? (
            <p className="text-center opacity-60 py-8">
              No links yet
            </p>
          ) : (
            links.map((link) => (
              <div 
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
              >
                <LinkCard
                  title={link.title}
                  subtitle={link.subtitle}
                  url={link.url}
                  icon={link.icon}
                  color={link.color}
                  accentColor={getAccentColor()}
                  textColor={getTextColor()}
                />
              </div>
            ))
          )}
        </div>

        {/* PREMIUM FEATURE: Hide branding for premium users */}
        {!profile.remove_branding && (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: getThemeStyles().color }}
            >
              Made with Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
