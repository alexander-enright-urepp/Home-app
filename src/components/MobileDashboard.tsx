"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Link2, 
  Plus, 
  Settings, 
  LogOut, 
  ExternalLink,
  GripVertical,
  Trash2
} from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
}

export function MobileDashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchLinks();
    fetchProfile();
  }, []);

  async function fetchLinks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("order", { ascending: true });

    setLinks(data || []);
    setLoading(false);
  }

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  }

  async function addLink() {
    if (!newTitle || !newUrl) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("links").insert({
      title: newTitle,
      url: newUrl,
      user_id: user.id,
      order: links.length,
    });

    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
    fetchLinks();
  }

  async function deleteLink(id: string) {
    await supabase.from("links").delete().eq("id", id);
    fetchLinks();
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Home
            </h1>
            <p className="text-sm text-gray-400">
              @{profile?.username || "user"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 mx-auto mb-3 flex items-center justify-center text-black font-bold text-xl">
            {profile?.display_name?.[0] || profile?.username?.[0] || "?"}
          </div>
          <h2 className="font-semibold text-lg">
            {profile?.display_name || profile?.username || "Your Profile"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{profile?.bio || "Add a bio"}</p>
          <button
            onClick={() => window.open(`https://ae-home-app.vercel.app/${profile?.username}`, '_system')}
            className="inline-flex items-center gap-1 text-emerald-400 text-sm mt-3"
          >
            View Public Page <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-300">Your Links</h3>
          <span className="text-sm text-gray-500">{links.length} total</span>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-gray-800/50 rounded-xl p-4 flex items-center gap-3"
            >
              <div className="p-2 bg-gray-700 rounded-lg">
                <Link2 size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.title}</p>
                <p className="text-sm text-gray-500 truncate">{link.url}</p>
              </div>
              <button
                onClick={() => deleteLink(link.id)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Link2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No links yet</p>
            <p className="text-sm">Add your first link below</p>
          </div>
        )}
      </div>

      {/* Add Link Button */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25"
      >
        <Plus size={28} />
      </button>

      {/* Add Link Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-gray-900 w-full rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Add New Link</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Link Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={addLink}
              disabled={!newTitle || !newUrl}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              Add Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
