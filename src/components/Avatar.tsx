"use client";

import { User } from "lucide-react";
import Image from "next/image";

interface AvatarProps {
  url: string | null;
  alt: string;
  size?: number;
}

export function Avatar({ url, alt, size = 80 }: AvatarProps) {
  const initial = alt.charAt(0).toUpperCase();

  if (url) {
    return (
      <Image
        src={url}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-accent flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial || <User className="w-1/2 h-1/2" />}
    </div>
  );
}
