"use client";

import { createClient } from "@/lib/supabase/client";
// 1. Import 'Wand2' for our new section
import { Loader2, Mail, Lock, Wand2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link"; // 2. Import Link

// --- THIS IS THE FIX ---
// This tells Vercel not to prerender this page, which solves the build error
export const dynamic = 'force-dynamic';
// --- END FIX ---

function SettingsContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // To read errors from the URL

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 3. New state to check if TikTok is connected
  const [isTikTokConnected, setIsTikTokConnected] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false); // For the connect button

  useEffect(() => {
    // 4. Check for connection or password reset messages
    const error = searchParams.get('error');
    if (error) {
      setMessage({ type: 'error', text: error });
    }

    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 5. NEW: Check if user has a TikTok connection
      const { data: connection } = await supabase
        .from('social_connections')
        .select('platform_username')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .single();
      
      if (connection) {
        setIsTikTokConnected(true);
        setTikTokUsername(connection.platform_username);
      }

      setLoading(false);
    };
    getUser();
  }, [supabase, router, searchParams]);
  
  // 6. NEW: Function to disconnect
  const handleDisconnectTikTok = async () => {
    setIsConnecting(true);
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('platform', 'tiktok'); // RLS policy handles the user_id

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setIsTikTokConnected(false);
      setTikTokUsername(null);
      setMessage({ type: 'success', text: 'TikTok account disconnected.' });
    }
    setIsConnecting(false);
  };


  const handlePasswordReset = async () => {
    // ... (Your existing password reset code - no changes)
    if (!user?.email) return;
    setResetting(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Check your email for the password reset link.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

      <div className="bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-8">
        
        {/* --- 7. NEW SECTION: Connect Accounts --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Connect Accounts
          </h3>
          <p className="text-slate-400 text-sm">
            Connect your social media accounts to allow Jedi Scheduler to post on your behalf.
          </p>

          <div className="flex items-center justify-between p-4 bg-[#141619] rounded-lg border border-white/10">
            <span className="text-lg font-medium text-white">
              {isTikTokConnected ? `TikTok (@${tikTokUsername})` : "TikTok"}
            </span>
            
            {isTikTokConnected ? (
              <button
                onClick={handleDisconnectTikTok}
                disabled={isConnecting}
                className="flex items-center justify-center gap-2 w-32 px-4 py-2 font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Disconnect"}
              </button>
            ) : (
              // This is the Link that calls our new API route
              <Link
                href="/api/auth/tiktok/start"
                onClick={() => setIsConnecting(true)}
                className="flex items-center justify-center gap-2 w-32 px-4 py-2 font-bold bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-all"
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connect"}
              </Link>
            )}
          </div>
        </div>
        {/* --- END NEW SECTION --- */}


        {/* Email Section (Read-only for now) */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Email Address</label>
          <div className="flex items-center p-4 rounded-xl border border-white/10 bg-[#141619] text-slate-400">
            <Mail className="w-5 h-5 mr-3" />
            <span>{user?.email}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">To change your email, please contact support.</p>
        </div>

        {/* Password Reset Section */}
        <div className="pt-6 border-t border-white/5">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Click the button below to receive an email with a link to reset your password.
          </p>
          
          {/* This message div will now show all messages (Connection success/error, Password success/error) */}
          {message && (
            <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handlePasswordReset}
            disabled={resetting}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl transition-all border border-white/10 disabled:opacity-50"
          >
            {resetting ? <Loader2 className="w-5 h-s animate-spin" /> : <Lock className="w-5 h-5" />}
            {resetting ? "Sending..." : "Send Password Reset Email"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Wrap the component in Suspense
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}