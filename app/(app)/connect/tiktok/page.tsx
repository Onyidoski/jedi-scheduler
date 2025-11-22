"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Wand2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function TikTokConnectContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isTikTokConnected, setIsTikTokConnected] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
    }

    const getUserAndConnection = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }

      // Check for existing TikTok connection
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
    getUserAndConnection();
  }, [supabase, router, searchParams]);
  
  const handleDisconnectTikTok = async () => {
    setIsDisconnecting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'tiktok'); 

        if (error) {
        setMessage({ type: 'error', text: error.message });
        } else {
        setIsTikTokConnected(false);
        setTikTokUsername(null);
        setMessage({ type: 'success', text: 'TikTok account disconnected.' });
        router.refresh();
        }
    }
    setIsDisconnecting(false);
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
      <h1 className="text-3xl font-bold mb-8 text-white">Connect TikTok</h1>

      <div className="bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl">
        
        <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-[#141619] rounded-full flex items-center justify-center mb-4 border border-white/10">
                {/* Simple TikTok Icon representation */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
                {isTikTokConnected ? `Connected as @${tikTokUsername || 'User'}` : "Connect your TikTok Account"}
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {isTikTokConnected 
                    ? "Your TikTok account is active. You can now schedule and publish videos directly."
                    : "Connect your account to enable auto-publishing and analytics tracking for your TikTok content."}
            </p>

            {/* Message Display */}
            {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.text}
                </div>
            )}

            {isTikTokConnected ? (
                <button
                    onClick={handleDisconnectTikTok}
                    disabled={isDisconnecting}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-3 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                >
                    {isDisconnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Disconnect TikTok"}
                </button>
            ) : (
                <a
                    href="/api/auth/tiktok/start"
                    className="flex items-center justify-center gap-2 mx-auto px-8 py-4 font-bold bg-[#FE2C55] text-white rounded-xl hover:opacity-90 transition-all w-fit"
                >
                    Connect TikTok
                </a>
            )}
        </div>

      </div>
    </div>
  );
}

export default function TikTokPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <TikTokConnectContent />
    </Suspense>
  );
}