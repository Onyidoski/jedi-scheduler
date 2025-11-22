"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function SettingsContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMessage({ type: 'error', text: decodeURIComponent(error) });
    }

    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase, router, searchParams]);

  const handlePasswordReset = async () => {
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
        
        {/* Email Section */}
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
          
          {/* Message Display */}
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
            {resetting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {resetting ? "Sending..." : "Send Password Reset Email"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}