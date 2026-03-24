"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, ExternalLink, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LinkRow } from "@/components/LinkRow";
import { LinkModal } from "@/components/LinkModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import toast from "react-hot-toast";

interface Link {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  icon: string | null;
  color: string | null;
  order: number;
  is_visible: boolean;
}

interface Profile {
  username: string;
  display_name: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No user, redirect to login
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch links
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("order", { ascending: true });

      if (linksError) {
        console.error("Error fetching links:", linksError);
      } else {
        setLinks(linksData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const handleAddLink = async (formData: {
    title: string;
    subtitle: string;
    url: string;
    icon: string;
    color: string;
    is_visible: boolean;
  }) => {
    if (!userId) return;

    const newLink = {
      user_id: userId,
      title: formData.title,
      subtitle: formData.subtitle || null,
      url: formData.url,
      icon: formData.icon || null,
      color: formData.color || "#ffffff",
      order: links.length,
      is_visible: formData.is_visible,
    };

    const { data, error } = await supabase
      .from("links")
      .insert(newLink)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setLinks([...links, data]);
  };

  const handleEditLink = async (formData: {
    title: string;
    subtitle: string;
    url: string;
    icon: string;
    color: string;
    is_visible: boolean;
  }) => {
    if (!editingLink) return;

    const { error } = await supabase
      .from("links")
      .update({
        title: formData.title,
        subtitle: formData.subtitle || null,
        url: formData.url,
        icon: formData.icon || null,
        color: formData.color || "#ffffff",
        is_visible: formData.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingLink.id);

    if (error) {
      throw error;
    }

    setLinks(
      links.map((link) =>
        link.id === editingLink.id
          ? {
              ...link,
              title: formData.title,
              subtitle: formData.subtitle || null,
              url: formData.url,
              icon: formData.icon || null,
              color: formData.color || "#ffffff",
              is_visible: formData.is_visible,
            }
          : link
      )
    );
    setEditingLink(null);
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete link");
      return;
    }

    setLinks(links.filter((link) => link.id !== id));
    toast.success("Link deleted");
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    const { error } = await supabase
      .from("links")
      .update({ is_visible: !isVisible })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update visibility");
      return;
    }

    setLinks(
      links.map((link) =>
        link.id === id ? { ...link, is_visible: !isVisible } : link
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Update order in database
      const updates = newLinks.map((link, index) => ({
        id: link.id,
        order: index,
      }));

      const { error } = await supabase.from("links").upsert(
        updates.map((u) => ({
          id: u.id,
          order: u.order,
        }))
      );

      if (error) {
        toast.error("Failed to save order");
        console.error("Error updating order:", error);
      } else {
        toast.success("Order saved");
      }
    }
  };

  const openAddModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const openEditModal = (link: Link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
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

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display">Home</h1>
            {profile && (
              <span className="text-muted">@{profile.username}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-surface transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Add Link Button */}
        <button
          onClick={openAddModal}
          className="w-full py-3 mb-6 border-2 border-dashed border-slate-300 rounded-xl text-muted hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Link
        </button>

        {/* Links List */}
        {links.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted">
              You haven&apos;t added any links yet.{" "}
              <button
                onClick={openAddModal}
                className="text-accent hover:underline"
              >
                Add your first one!
              </button>
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {links.map((link) => (
                  <LinkRow
                    key={link.id}
                    id={link.id}
                    title={link.title}
                    subtitle={link.subtitle}
                    url={link.url}
                    icon={link.icon}
                    isVisible={link.is_visible}
                    onToggleVisibility={() =>
                      handleToggleVisibility(link.id, link.is_visible)
                    }
                    onEdit={() => openEditModal(link)}
                    onDelete={() => handleDeleteLink(link.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <LinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLink(null);
        }}
        onSave={editingLink ? handleEditLink : handleAddLink}
        initialData={
          editingLink
            ? {
                title: editingLink.title,
                subtitle: editingLink.subtitle || "",
                url: editingLink.url,
                icon: editingLink.icon || "",
                color: editingLink.color || "#ffffff",
                is_visible: editingLink.is_visible,
              }
            : undefined
        }
        mode={editingLink ? "edit" : "add"}
      />
    </div>
  );
}
