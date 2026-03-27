import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "home-auth-token",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Helper function to create or update profile
export async function createOrUpdateProfile(
  userId: string,
  username: string,
  displayName?: string,
  bio?: string
) {
  // First try to update
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username, display_name: displayName, bio })
    .eq("id", userId);

  if (!updateError) {
    return { success: true, error: null };
  }

  // If update failed (no row), try insert with .select() to get the result
  const { error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      display_name: displayName || '',
      bio: bio || '',
    })
    .select();

  return { success: !insertError, error: insertError };
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subtitle: string | null;
          url: string;
          icon: string | null;
          color: string | null;
          order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subtitle?: string | null;
          url: string;
          icon?: string | null;
          color?: string | null;
          order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subtitle?: string | null;
          url?: string;
          icon?: string | null;
          color?: string | null;
          order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
