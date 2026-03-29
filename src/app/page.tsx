import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  // Check if user is logged in
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      redirect("/dashboard");
    }
  }

  return <LandingPage />;
}
