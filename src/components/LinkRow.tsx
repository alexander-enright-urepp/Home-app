"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Pencil, Trash2, Link2, LucideIcon } from "lucide-react";
import { isLucideIcon } from "@/lib/utils";
import { icons } from "lucide-react";

interface LinkRowProps {
  id: string;
  title: string;
  subtitle?: string | null;
  url: string;
  icon?: string | null;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
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

export function LinkRow({
  id,
  title,
  subtitle,
  url,
  icon,
  isVisible,
  onToggleVisibility,
  onEdit,
  onDelete,
}: LinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const emoji = icon && isEmoji(icon);
  
  // Try to get the Lucide icon
  let LucideIconComponent: LucideIcon | null = null;
  if (icon && !emoji && isLucideIcon(icon)) {
    const iconName = toPascalCase(icon);
    LucideIconComponent = (icons as Record<string, LucideIcon>)[iconName] || null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm border border-slate-100 ${
        !isVisible ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-muted hover:text-brand cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg">
        {emoji ? (
          <span>{icon}</span>
        ) : LucideIconComponent ? (
          <LucideIconComponent className="w-5 h-5 text-brand" />
        ) : (
          <Link2 className="w-5 h-5 text-brand" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-brand truncate">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleVisibility}
          className="p-2 text-muted hover:text-brand rounded-lg hover:bg-surface transition-colors"
          title={isVisible ? "Hide" : "Show"}
        >
          {isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-muted hover:text-brand rounded-lg hover:bg-surface transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
