'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, Share2, Instagram, Twitter, Youtube, Github, Linkedin, Globe, Mail, Music, Video, ExternalLink, Sparkles } from "lucide-react";

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
  instagram_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  public_email: string | null;
}

interface LinkItem {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

interface PageProps {
  params: { username: string };
}

const THEMES: Record<string, { 
  colors: { primary: string; secondary: string; background: string; accent: string; card: string; }
  gradient: string;
}> = {
  default: { 
    colors: { primary: "#0f172a", secondary: "#64748b", background: "#f8fafc", accent: "#10b981", card: "#ffffff" },
    gradient: "from-slate-100 to-slate-200"
  },
  dark: { 
    colors: { primary: "#ffffff", secondary: "#94a3b8", background: "#0f172a", accent: "#10b981", card: "#1e293b" },
    gradient: "from-slate-900 to-slate-800"
  },
  ocean: { 
    colors: { primary: "#0c4a6e", secondary: "#0369a1", background: "#f0f9ff", accent: "#0ea5e9", card: "#ffffff" },
    gradient: "from-sky-100 to-blue-200"
  },
  sunset: { 
    colors: { primary: "#7c2d12", secondary: "#c2410c", background: "#fff7ed", accent: "#f97316", card: "#ffffff" },
    gradient: "from-orange-100 to-amber-200"
  },
  forest: { 
    colors: { primary: "#14532d", secondary: "#15803d", background: "#f0fdf4", accent: "#22c55e", card: "#ffffff" },
    gradient: "from-green-100 to-emerald-200"
  },
  purple: { 
    colors: { primary: "#581c87", secondary: "#7c3aed", background: "#faf5ff", accent: "#a855f7", card: "#ffffff" },
    gradient: "from-purple-100 to-violet-200"
  },
  rose: { 
    colors: { primary: "#881337", secondary: "#e11d48", background: "#fff1f2", accent: "#fb7185", card: "#ffffff" },
    gradient: "from-rose-100 to-pink-200"
  },
  midnight: { 
    colors: { primary: "#e2e8f0", secondary: "#94a3b8", background: "#020617", accent: "#6366f1", card: "#0f172a" },
    gradient: "from-indigo-950 to-slate-900"
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  email: Mail,
  spotify: Music,
  tiktok: Video,
  default: ExternalLink,
};

export default function PublicProfilePage({ params }: PageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name, bio, avatar_url, is_premium, theme_preference, custom_colors, custom_font, remove_branding, instagram_url, x_url, youtube_url, tiktok_url, linkedin_url, public_email")
          .eq("username", params.username)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setProfile(profileData);

        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("id, title, subtitle, url, icon, color, sort_order")
          .eq("user_id", profileData.id)
          .eq("is_visible", true)
          .order("sort_order", { ascending: true });

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

  const handleLinkClick = async (linkId: string) => {
    console.log('Link clicked:', linkId, 'Profile:', profile?.id, 'isPremium:', profile?.is_premium);
    if (!profile) return;

    if (profile.is_premium) {
      try {
        console.log('Sending analytics request...');
        const response = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            link_id: linkId,
            user_id: profile.id,
          }),
        });
        console.log('Analytics response:', response.status);
      } catch (error) {
        console.error("Failed to track click:", error);
      }
    } else {
      console.log('Not premium, skipping analytics');
    }
  };

  const getTheme = () => {
    if (!profile) return THEMES.default;
    
    const theme = THEMES[profile.theme_preference] || THEMES.default;
    
    if (profile.is_premium && profile.custom_colors) {
      return {
        ...theme,
        colors: {
          ...theme.colors,
          primary: profile.custom_colors.primary || theme.colors.primary,
          secondary: profile.custom_colors.secondary || theme.colors.secondary,
          background: profile.custom_colors.background || theme.colors.background,
          accent: profile.custom_colors.accent || theme.colors.accent,
        }
      };
    }
    
    return theme;
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return ExternalLink;
    const key = iconName.toLowerCase();
    return ICON_MAP[key] || ICON_MAP.default;
  };

  const theme = getTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mb-4" />
          <div className="w-32 h-4 bg-white/20 rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center px-4`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.primary }}>
            Page Not Found
          </h1>
          <p className="mb-6 opacity-70" style={{ color: theme.colors.secondary }}>
            We couldn&apos;t find @{params.username}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{ 
              backgroundColor: theme.colors.accent, 
              color: '#ffffff' 
            }}
          >
            <Sparkles className="w-4 h-4" />
            Create Your Aylae
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Container */}
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Profile Card */}
        <div 
          className="rounded-3xl p-8 mb-6 backdrop-blur-xl shadow-2xl"
          style={{ 
            backgroundColor: `${theme.colors.card}95`,
            border: `1px solid ${theme.colors.accent}20`
          }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 shadow-lg"
              style={{ 
                ringColor: `${theme.colors.accent}40`,
                border: `2px solid ${theme.colors.card}`
              }}
            >
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-3xl font-bold"
                  style={{ backgroundColor: theme.colors.accent, color: '#ffffff' }}
                >
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ color: theme.colors.primary }}
            >
              {profile.display_name || `@${profile.username}`}
            </h1>

            {/* Username badge */}
            <span 
              className="text-sm font-medium px-3 py-1 rounded-full mb-3"
              style={{ 
                backgroundColor: `${theme.colors.accent}15`,
                color: theme.colors.accent
              }}
            >
              @{profile.username}
            </span>

            {/* Bio */}
            {profile.bio && (
              <p 
                className="text-center text-sm leading-relaxed max-w-xs"
                style={{ color: theme.colors.secondary }}
              >
                {profile.bio}
              </p>
            )}

            {/* Social Links & Share */}
            {(profile.instagram_url || profile.x_url || profile.youtube_url || profile.tiktok_url || profile.public_email || true) && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {profile.instagram_url && (
                  <a 
                    href={profile.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {profile.x_url && (
                  <a 
                    href={profile.x_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {profile.youtube_url && (
                  <a 
                    href={profile.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {profile.tiktok_url && (
                  <a 
                    href={profile.tiktok_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Music className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.public_email && (
                  <a 
                    href={`mailto:${profile.public_email}`}
                    className="p-3 rounded-full transition-all hover:scale-110"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                {/* Share button */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${profile.display_name || profile.username}'s Profile`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="p-3 rounded-full transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: `${theme.colors.accent}15`,
                    color: theme.colors.accent
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <div 
              className="text-center py-12 rounded-2xl"
              style={{ 
                backgroundColor: `${theme.colors.card}60`,
                border: `1px dashed ${theme.colors.secondary}30`
              }}
            >
              <p style={{ color: theme.colors.secondary }}>No links yet</p>
            </div>
          ) : (
            links.map((link, index) => {
              const IconComponent = getIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className="group flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{ 
                    backgroundColor: link.color || theme.colors.card,
                    border: `1px solid ${theme.colors.secondary}10`
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${theme.colors.accent}20`,
                      color: theme.colors.accent
                    }}
                  >
                    {link.icon ? (
                      <span>{link.icon}</span>
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold truncate"
                      style={{ color: theme.colors.primary }}
                    >
                      {link.title}
                    </h3>
                    {link.subtitle && (
                      <p 
                        className="text-sm truncate opacity-70"
                        style={{ color: theme.colors.secondary }}
                      >
                        {link.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ArrowUpRight 
                    className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: theme.colors.secondary }}
                  />
                </a>
              );
            })
          )}
        </div>

        {/* Footer Branding */}
        {!profile.remove_branding && (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ 
                backgroundColor: `${theme.colors.card}80`,
                color: theme.colors.secondary,
                border: `1px solid ${theme.colors.secondary}20`
              }}
            >
              <Sparkles className="w-4 h-4" />
              Made with Aylae
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
