"use client";

import { createClient } from "@/lib/supabase/client";
import { Calendar, Save, ArrowLeft, Loader2, Trash2 } from "lucide-react"; // Added Trash2 icon
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); // New state for deletion
  const [caption, setCaption] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [videoPath, setVideoPath] = useState(""); // Need to store this to delete the file

  // --- 1. FETCH DATA ---
  useEffect(() => {
    async function fetchPost() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: post, error } = await supabase
        .from("Posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !post) {
        router.push("/calendar");
        return;
      }

      setCaption(post.caption || "");
      setPlatforms(post.platforms || []);
      setVideoPath(post.video_url); // Save the file path for deletion later
      if (post.scheduled_at) {
        const date = new Date(post.scheduled_at);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setScheduledAt(date.toISOString().slice(0, 16));
      }
      setLoading(false);
    }
    fetchPost();
  }, [id, router, supabase]);

  // --- 2. HANDLE UPDATE ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("Posts")
      .update({
        caption: caption,
        platforms: platforms,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        status: scheduledAt ? 'scheduled' : 'published'
      })
      .eq("id", id);

    if (error) {
      alert("Error updating: " + error.message);
      setSaving(false);
    } else {
      router.push("/calendar");
      router.refresh();
    }
  };

  // --- 3. HANDLE DELETE (NEW) ---
  const handleDelete = async () => {
    // Double check with the user first!
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      // Step A: Delete the video file from Storage
      if (videoPath) {
        const { error: storageError } = await supabase.storage
          .from('Videos')
          .remove([videoPath]);
        
        if (storageError) console.error("Error deleting file:", storageError);
      }

      // Step B: Delete the record from Database
      const { error: dbError } = await supabase
        .from('Posts')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Success! Redirect back to dashboard
      router.push("/dashboard");
      router.refresh();

    } catch (error: any) {
      alert("Error deleting post: " + error.message);
      setDeleting(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) setPlatforms(platforms.filter((p) => p !== platform));
    else setPlatforms([...platforms, platform]);
  };

  if (loading) return <div className="p-20 text-center text-slate-500">Loading post...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/calendar" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Calendar
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Post Details</h1>
        {/* Delete Button (Top Right) */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || saving}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? "Deleting..." : "Delete Post"}
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8 bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl">
        {/* Caption */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Caption</label>
          <textarea
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-4 rounded-xl border border-white/10 bg-[#141619] text-white placeholder:text-slate-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none resize-none"
          />
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Select Platforms</label>
          <div className="flex flex-wrap gap-3">
            {["TikTok", "Instagram", "YouTube", "Facebook"].map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => handlePlatformToggle(platform)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                  platforms.includes(platform)
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#141619] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div className="pt-6 border-t border-white/5">
          <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
             <Calendar className="w-4 h-4 text-slate-500" />
             Reschedule (Optional)
          </label>
          <input
             type="datetime-local"
             value={scheduledAt}
             onChange={(e) => setScheduledAt(e.target.value)}
             className="p-3 rounded-xl border border-white/10 bg-[#141619] text-slate-300 outline-none focus:border-[#8B5CF6] [color-scheme:dark]"
          />
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-white/5">
          <button
            type="submit"
            disabled={saving || deleting}
            className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}