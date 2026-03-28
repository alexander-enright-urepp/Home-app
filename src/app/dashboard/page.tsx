"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Plus, ExternalLink, LogOut, User, BarChart3, Palette, CreditCard, CheckCircle, Copy, Check, Camera, Upload, X, Sparkles, Type } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription, SubscriptionProvider } from "@/lib/subscription";
import { LinkRow } from "@/components/LinkRow";
import { LinkModal } from "@/components/LinkModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { UpgradeCTA, PremiumBadge, LinkLimitIndicator } from "@/components/UpgradeCTA";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import toast from "react-hot-toast";

interface LinkItem {
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
  bio: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  theme_preference: string;
}

// PREMIUM FEATURE: Tab type for navigation
type Tab = 'links' | 'analytics' | 'themes' | 'subscription';

// PREMIUM GATE: Maximum links for free users
const FREE_LINK_LIMIT = 5;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, canAddLink, linkCount, refreshSubscription } = useSubscription();
  
  // State
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('links');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  // Check for checkout success/canceled params
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      setShowCheckoutSuccess(true);
      // Refresh subscription data and re-fetch profile
      const refreshData = async () => {
        await refreshSubscription();
        // Also re-fetch profile to get updated is_premium status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, display_name, bio, is_premium, theme_preference')
            .eq('id', user.id)
            .single();
          if (profileData) {
            setProfile(profileData);
            console.log('Profile refreshed, is_premium:', profileData.is_premium);
          }
        }
      };
      refreshData();
      // Clear the param after a delay so success message shows
      setTimeout(() => {
        router.replace('/dashboard');
        setShowCheckoutSuccess(false);
      }, 2500);
    } else if (checkout === 'canceled') {
      toast('Checkout canceled', { icon: '⚠️' });
      router.replace('/dashboard');
    }
  }, [searchParams, router, refreshSubscription]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = useCallback(async () => {
    try {
      // First, ensure we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No valid session, redirecting to login...");
        router.push("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Fetch profile with retry
      let profileData = null;
      let profileError = null;
      
      // Try 3 times with delay
      for (let i = 0; i < 3; i++) {
        const result = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (result.data) {
          profileData = result.data;
          break;
        }
        
        profileError = result.error;
        
        if (i < 2) {
          console.log(`Retry ${i + 1}: Profile not found, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!profileData && profileError?.code === 'PGRST116') {
        console.log("No profile found, redirecting to login...");
        router.push("/login?setup=true");
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setBioInput(profileData.bio || "");
        setNameInput(profileData.display_name || "");
      } else if (profileError) {
        console.log("No profile found, redirecting to login...");
        router.push("/login?setup=true");
        return;
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

  // PREMIUM GATE: Check link limit before adding
  const handleAddLink = async (formData: {
    title: string;
    subtitle: string;
    url: string;
    icon: string;
    color: string;
    is_visible: boolean;
  }) => {
    if (!userId) return;

    // PREMIUM GATE: Prevent free users from exceeding 5 links
    if (!isPremium && links.length >= FREE_LINK_LIMIT) {
      toast.error("Free plan limited to 5 links. Upgrade to Premium for unlimited!");
      return;
    }

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
    toast.success("Link added!");
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

  // PREMIUM FEATURE: Drag-drop reordering (gated for free users)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // PREMIUM GATE: Free users can't reorder
    if (!isPremium) {
      toast.error("Link reordering is a Premium feature!");
      return;
    }

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Update order in database
      try {
        for (let i = 0; i < newLinks.length; i++) {
          const { error } = await supabase
            .from("links")
            .update({ order: i })
            .eq("id", newLinks[i].id);
          
          if (error) throw error;
        }
        toast.success("Order saved");
      } catch (error) {
        toast.error("Failed to save order");
        console.error("Error updating order:", error);
      }
    }
  };

  const handleSaveBio = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ bio: bioInput })
      .eq("id", userId);

    if (error) {
      console.error("Update failed:", error);
      toast.error("Failed to save bio: " + error.message);
      return;
    }

    setProfile((prev) => prev ? { ...prev, bio: bioInput } : null);
    setIsEditingBio(false);
    toast.success("Bio updated");
  };

  // Save Display Name
  const handleSaveName = async () => {
    if (!userId) {
      console.error("No userId available");
      return;
    }

    console.log("Saving display name:", nameInput, "for user:", userId);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: nameInput })
      .eq("id", userId);

    if (error) {
      console.error("Update failed:", error);
      toast.error("Failed to save name: " + error.message);
      return;
    }

    console.log("Name saved successfully");
    setProfile((prev) => prev ? { ...prev, display_name: nameInput } : null);
    setIsEditingName(false);
    toast.success("Name updated");
  };

  // Profile Picture Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Max 2MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, or GIF');
      return;
    }

    setUploadingAvatar(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userId || !profile?.avatar_url) return;

    setUploadingAvatar(true);
    
    try {
      // Update profile to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: null } : null);
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleThemeChange = async (themeId: string) => {
    if (!userId) return;
    
    // Clear custom colors when selecting a theme (use theme colors instead)
    const { error } = await supabase
      .from("profiles")
      .update({ 
        theme_preference: themeId,
        custom_colors: null // Reset to use theme colors
      })
      .eq("id", userId);
    
    if (error) {
      toast.error("Failed to update theme");
      return;
    }
    
    setProfile((prev) => prev ? { ...prev, theme_preference: themeId, custom_colors: null } : null);
    toast.success("Theme updated!");
  };

  // PREMIUM: Handle custom color changes
  const handleColorChange = async (colorKey: string, value: string) => {
    if (!userId || !isPremium) return;
    
    const newColors = {
      ...profile?.custom_colors,
      [colorKey]: value,
    };
    
    const { error } = await supabase
      .from("profiles")
      .update({ custom_colors: newColors })
      .eq("id", userId);
    
    if (error) {
      toast.error("Failed to update color");
      return;
    }
    
    setProfile((prev) => prev ? { ...prev, custom_colors: newColors } : null);
  };

  // PREMIUM: Handle branding toggle
  const handleBrandingToggle = async () => {
    if (!userId || !isPremium) return;
    
    const newValue = !profile?.remove_branding;
    
    const { error } = await supabase
      .from("profiles")
      .update({ remove_branding: newValue })
      .eq("id", userId);
    
    if (error) {
      toast.error("Failed to update branding");
      return;
    }
    
    setProfile((prev) => prev ? { ...prev, remove_branding: newValue } : null);
    toast.success(newValue ? "Branding removed!" : "Branding restored");
  };

  // PREMIUM: Handle font change
  const handleFontChange = async (font: string) => {
    if (!userId || !isPremium) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ custom_font: font })
      .eq("id", userId);
    
    if (error) {
      toast.error("Failed to update font");
      return;
    }
    
    setProfile((prev) => prev ? { ...prev, custom_font: font } : null);
    toast.success("Font updated!");
  };

  // Copy public profile link to clipboard
  const [copied, setCopied] = useState(false);
  const copyProfileLink = async () => {
    if (!profile?.username) return;
    
    const profileUrl = `${window.location.origin}/${profile.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const openAddModal = () => {
    // PREMIUM GATE: Check before opening modal
    if (!canAddLink) {
      toast.error("Link limit reached! Upgrade to Premium for unlimited links.");
      return;
    }
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
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

  // Checkout success message
  if (showCheckoutSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to Premium!
          </h1>
          <p className="text-slate-600 mb-6">
            Your subscription is now active. You now have access to all premium features.
          </p>
          <button
            onClick={() => setShowCheckoutSuccess(false)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display">Home</h1>
              {profile && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">|</span>
                  <Link
                    href={`/${profile.username}`}
                    target="_blank"
                    className="text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    @{profile.username}
                  </Link>
                  <button
                    onClick={copyProfileLink}
                    className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    title="Copy profile link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              )}
              {isPremium && <PremiumBadge />}
            </div>
            <div className="flex items-center gap-2">
              {profile && (
                <Link
                  href={`/${profile.username}`}
                  target="_blank"
                  className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-slate-50 transition-colors"
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
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <nav className="flex gap-1 -mb-px">
            {[
              { id: 'links', label: 'Links', icon: ExternalLink },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, premium: true },
              { id: 'themes', label: 'Themes', icon: Palette },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.premium && !isPremium && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded">PRO</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <h2 className="font-medium">Profile Picture</h2>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Avatar Display */}
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex flex-col gap-2">
                  <label className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors cursor-pointer ${uploadingAvatar ? 'opacity-50' : ''}`}>
                    <Upload className="w-4 h-4" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  
                  {profile?.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      disabled={uploadingAvatar}
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                  
                  <p className="text-sm text-slate-500">
                    Recommended: 400x400px, JPG or PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <h2 className="font-medium">Display Name</h2>
                </div>
                {!isEditingName ? (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(profile?.display_name || "");
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveName}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              {isEditingName ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your display name..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  maxLength={50}
                />
              ) : (
                <p className="text-slate-600">
                  {profile?.display_name || "No name set. Click Edit to add one."}
                </p>
              )}
              
              {isEditingName && (
                <p className="text-xs text-slate-500 mt-2">
                  {nameInput.length}/50 characters
                </p>
              )}
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <h2 className="font-medium">Bio</h2>
                </div>
                {!isEditingBio ? (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingBio(false);
                        setBioInput(profile?.bio || "");
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              {isEditingBio ? (
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Tell people about yourself..."
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  maxLength={160}
                />
              ) : (
                <p className="text-slate-600">
                  {profile?.bio || "No bio yet. Click Edit to add one."}
                </p>
              )}
              
              {isEditingBio && (
                <p className="text-xs text-slate-500 mt-2">
                  {bioInput.length}/160 characters
                </p>
              )}
            </div>

            {/* Link Limit Indicator */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Your Links</h2>
              <LinkLimitIndicator 
                current={links.length} 
                max={FREE_LINK_LIMIT} 
                isPremium={isPremium} 
              />
            </div>

            {/* Add Link Button with limit check */}
            <button
              onClick={openAddModal}
              disabled={!canAddLink}
              className={`w-full py-4 mb-2 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${
                canAddLink
                  ? 'border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
              {canAddLink ? 'Add Link' : 'Link Limit Reached'}
            </button>

            {/* Show upgrade CTA when at or near limit */}
            {!isPremium && links.length >= FREE_LINK_LIMIT - 1 && (
              <UpgradeCTA 
                title="Need more links?"
                description={`You're using ${links.length}/${FREE_LINK_LIMIT} free links. Upgrade for unlimited!`}
                size="small"
              />
            )}

            {/* Links List */}
            {links.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600">
                  You haven't added any links yet.{" "}
                  <button
                    onClick={openAddModal}
                    className="text-emerald-600 hover:underline font-medium"
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

            {/* Reorder hint for free users */}
            {!isPremium && links.length > 1 && (
              <p className="text-sm text-slate-500 text-center">
                💡 Premium users can drag and drop to reorder links
              </p>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <ThemeSelector 
                currentTheme={profile?.theme_preference || 'default'}
                onThemeChange={handleThemeChange}
              />
            </div>

            {/* PREMIUM: Custom Colors */}
            {isPremium && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900">Custom Colors</h3>
                  <PremiumBadge />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Profile Title Color</label>
                    <input 
                      type="color" 
                      value={profile?.custom_colors?.primary || '#0f172a'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Background Color</label>
                    <input 
                      type="color" 
                      value={profile?.custom_colors?.background || '#ffffff'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Link Title Color</label>
                    <input 
                      type="color" 
                      value={profile?.custom_colors?.accent || '#10b981'}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Link Subtitle Color</label>
                    <input 
                      type="color" 
                      value={profile?.custom_colors?.secondary || '#334155'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mt-4">
                  Custom colors override the theme colors on your public profile.
                </p>
              </div>
            )}

            {/* PREMIUM: Branding Toggle */}
            {isPremium && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Remove Home Branding</h3>
                      <p className="text-sm text-slate-500">Hide "Made with Home" from your profile</p>
                    </div>
                    <PremiumBadge />
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={profile?.remove_branding || false}
                      onChange={handleBrandingToggle}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            )}

            {/* PREMIUM: Custom Font */}
            {isPremium && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900">Custom Font</h3>
                  <PremiumBadge />
                </div>
                
                <select 
                  value={profile?.custom_font || 'dm-sans'}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="dm-sans">DM Sans (Default)</option>
                  <option value="dm-serif">DM Serif Display</option>
                  <option value="inter">Inter</option>
                  <option value="roboto">Roboto</option>
                  <option value="poppins">Poppins</option>
                  <option value="playfair">Playfair Display</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lora">Lora</option>
                  <option value="oswald">Oswald</option>
                  <option value="raleway">Raleway</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <SubscriptionManager />
        )}
      </main>

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

// Wrap with SubscriptionProvider and Suspense for useSearchParams
import { Suspense } from 'react';

function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SubscriptionProvider>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </SubscriptionProvider>
  );
}
