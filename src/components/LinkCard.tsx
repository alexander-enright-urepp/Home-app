"use client";

import { Link2, LucideIcon } from "lucide-react";
import { isLucideIcon } from "@/lib/utils";
import { icons } from "lucide-react";

interface LinkCardProps {
  title: string;
  subtitle?: string | null;
  url: string;
  icon?: string | null;
  color?: string | null;
  accentColor?: string;
  textColor?: string; // For subtitle text
}

// Convert kebab-case to PascalCase for Lucide icons
function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Check if string is emoji
function isEmoji(str: string): boolean {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  return emojiRegex.test(str);
}

export function LinkCard({ 
  title, 
  subtitle, 
  url, 
  icon, 
  color,
  accentColor = "#0f172a",
  textColor = "#334155" // Default gray for subtitle
}: LinkCardProps) {
  const emoji = icon && isEmoji(icon);
  
  // Try to get the Lucide icon
  let LucideIconComponent: LucideIcon | null = null;
  if (icon && !emoji && isLucideIcon(icon)) {
    const iconName = toPascalCase(icon);
    LucideIconComponent = (icons as Record<string, LucideIcon>)[iconName] || null;
  }

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  return (
    <a
      href={normalizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: color || "#ffffff" }}
    >
      <div 
        className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl"
      >
        {emoji ? (
          <span>{icon}</span>
        ) : LucideIconComponent ? (
          <LucideIconComponent 
            className="w-6 h-6" 
            style={{ color: accentColor }}
          />
        ) : (
          <Link2 
            className="w-6 h-6" 
            style={{ color: accentColor }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="font-semibold truncate"
          style={{ color: accentColor }}
        >
          {title}
003c/p>
        {subtitle && (
          <p 
            className="text-sm truncate"
            style={{ color: textColor }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </a>
  );
}
