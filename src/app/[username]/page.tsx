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

export default function PublicProfilePage({ params }: PageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-12 px-4">
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
        </div>      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">This page doesn&apos;t exist</h1>
          <p className="text-muted mb-6">
            We couldn&apos;t find a Home page for @{params.username}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-2">Something went wrong</h1>
          <p className="text-muted mb-6">Please try again later</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 pb-6 px-4">
      <div className="w-full max-w-md">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <Avatar
            url={profile.avatar_url}
            alt={profile.display_name || profile.username}
            size={80}
          />
          <h1 className="mt-4 text-2xl font-display text-brand">
            {profile.display_name || profile.username}
          </h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-muted text-center">{profile.bio}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3 w-full">
          {links.length === 0 ? (
            <p className="text-center text-muted py-8">
              No links yet
            </p>
          ) : (
            links.map((link) => (
              <LinkCard
                key={link.id}
                title={link.title}
                subtitle={link.subtitle}
                url={link.url}
                icon={link.icon}
                color={link.color}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-xs text-muted hover:text-brand transition-colors"
          >
            Made with Home
          </Link>
        </div>
      </div>
    </div>
  );
}
