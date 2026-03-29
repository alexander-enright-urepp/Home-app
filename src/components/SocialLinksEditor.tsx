'use client';

import { useState, useEffect } from 'react';
import { Instagram, Twitter, Youtube, Music, Mail, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface SocialLinksEditorProps {
  userId: string;
  profile: {
    instagram_url?: string | null;
    x_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    public_email?: string | null;
  } | null;
  onUpdate: () => void;
}

export function SocialLinksEditor({ userId, profile, onUpdate }: SocialLinksEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputs, setInputs] = useState({
    instagram_url: '',
    x_url: '',
    youtube_url: '',
    tiktok_url: '',
    public_email: '',
  });

  useEffect(() => {
    if (profile) {
      setInputs({
        instagram_url: profile.instagram_url || '',
        x_url: profile.x_url || '',
        youtube_url: profile.youtube_url || '',
        tiktok_url: profile.tiktok_url || '',
        public_email: profile.public_email || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        instagram_url: inputs.instagram_url || null,
        x_url: inputs.x_url || null,
        youtube_url: inputs.youtube_url || null,
        tiktok_url: inputs.tiktok_url || null,
        public_email: inputs.public_email || null,
      })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to save social links');
      return;
    }

    toast.success('Social links updated!');
    setIsEditing(false);
    onUpdate();
  };

  const hasAnySocial = profile?.instagram_url || profile?.x_url || profile?.youtube_url || profile?.tiktok_url || profile?.public_email;

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-400" />
            Social Links
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-pink-500" />
            <input
              type="url"
              value={inputs.instagram_url}
              onChange={(e) => setInputs({ ...inputs, instagram_url: e.target.value })}
              placeholder="https://instagram.com/username"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Twitter className="w-5 h-5 text-slate-900" />
            <input
              type="url"
              value={inputs.x_url}
              onChange={(e) => setInputs({ ...inputs, x_url: e.target.value })}
              placeholder="https://x.com/username"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Youtube className="w-5 h-5 text-red-500" />
            <input
              type="url"
              value={inputs.youtube_url}
              onChange={(e) => setInputs({ ...inputs, youtube_url: e.target.value })}
              placeholder="https://youtube.com/@channel"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-black" />
            <input
              type="url"
              value={inputs.tiktok_url}
              onChange={(e) => setInputs({ ...inputs, tiktok_url: e.target.value })}
              placeholder="https://tiktok.com/@username"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={inputs.public_email}
              onChange={(e) => setInputs({ ...inputs, public_email: e.target.value })}
              placeholder="contact@example.com"
              className="flex-1 p-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium flex items-center gap-2">
          <Globe className="w-5 h-5 text-slate-400" />
          Social Links <span className="text-slate-400 font-normal text-sm">(use exact url)</span>
        </h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
        >
          Edit
        </button>
      </div>

      {hasAnySocial ? (
        <div className="flex flex-wrap gap-3">
          {profile?.instagram_url && (
            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {profile?.x_url && (
            <a href={profile.x_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {profile?.youtube_url && (
            <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          )}
          {profile?.tiktok_url && (
            <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Music className="w-5 h-5" />
            </a>
          )}
          {profile?.public_email && (
            <a href={`mailto:${profile.public_email}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No social links added yet. Click Edit to add them.</p>
      )}
    </div>
  );
}
