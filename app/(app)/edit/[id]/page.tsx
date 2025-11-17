"use client";

import { createClient } from "@/lib/supabase/client";
import { Calendar, Save, ArrowLeft, Loader2, Trash2, X } from "lucide-react"; // Added X icon for modals
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
  
  // --- NEW STATE FOR MODALS ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
      // Use the new error modal instead of alert()
      setErrorMessage("Error updating: " + error.message);
      setSaving(false);
    } else {
      router.push("/calendar");
      router.refresh();
    }
  };

  // --- 3. HANDLE DELETE (NEW) ---
  // This function just *opens* the confirmation modal
  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  // This function contains the *actual* deletion logic
  const confirmDelete = async () => {
    setDeleting(true);
    setIsConfirmModalOpen(false); // Close the modal

    try {
      // Step A: Delete the video file from Storage
      if (videoPath) {
        const { data: fileData, error: storageError } = await supabase.storage
          .from('Videos')
          .remove([videoPath]);
        
        // --- THIS IS THE CRITICAL FIX ---
        // If storage fails, stop everything and throw the error
        if (storageError) {
          console.error("Error deleting file:", storageError);
          throw storageError; 
        }

        // --- NEW CHECK: Did the file actually get deleted? ---
        if (!fileData || fileData.length === 0) {
          // This can happen if RLS prevents deletion but doesn't throw an error
          // We've confirmed this is safe to ignore, as it just means the file was already gone.
          console.log("Storage.remove() returned no data. File may have been already deleted.");
        }
      }

      // Step B: Delete the record from Database
      const { error: dbError, count } = await supabase
        .from('Posts')
        .delete({ count: 'exact' }) // --- NEW: Ask Supabase to return the count ---
        .eq('id', id);

      if (dbError) throw dbError;

      // --- NEW CHECK: Did the row actually get deleted? ---
      // We check for null OR 0, just to be safe.
      if (count === null || count === 0) {
        throw new Error("Post record not found or RLS policy prevented deletion.");
      }

      // Success! Redirect back to dashboard
      router.push("/dashboard");
      router.refresh();

    } catch (error: any) {
      // Use the new error modal instead of alert()
      setErrorMessage("Error deleting post: " + error.message);
      setDeleting(false);
    }
  };


  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) setPlatforms(platforms.filter((p) => p !== platform));
    else setPlatforms([...platforms, platform]);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin" />
    </div>
  );

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <Link href="/calendar" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Calendar
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Post Details</h1>
          {/* Delete Button (Top Right) - Now opens the modal */}
          <button
            type="button"
            onClick={handleDeleteClick} // Changed from handleDelete
            disabled={deleting || saving}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
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

      {/* --- CONFIRMATION MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-[#1A1D21] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 mb-6">This post and its video file will be permanently deleted. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-[#141619] border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ERROR MODAL --- */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-[#1A1D21] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-red-400">An Error Occurred</h3>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 mb-6">{errorMessage}</p>
            <div className="flex">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="w-full py-3 px-4 rounded-lg font-medium bg-[#141619] border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}