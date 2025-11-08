"use client";

import { createClient } from "@/lib/supabase/client";
import { useCompletion } from "ai/react"; // <--- Vercel AI Hook
import { Calendar, CloudUpload, Loader2, Send, Sparkles, Video } from "lucide-react"; // <--- Added Sparkles
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePostPage() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // --- NEW: AI Hook ---
  const { complete, completion, isLoading: isAILoading } = useCompletion({
    api: "/api/generate",
    onFinish: (result) => {
        setCaption(result); // Update our main caption state when done
    }
  });

  const handleGenerateCaption = async () => {
    if (!file) {
        alert("Please upload a video first so the AI knows what to write about!");
        return;
    }
    // We send a prompt to the AI based on the filename for now
    // (Later we could add a small text input for "what is this video about?")
    complete(`Write a caption for a video titled: "${file.name}". Make it exciting and engaging.`);
  };

  // Sync AI completion with caption box while it streams
  // (This makes the text appear character-by-character amazingly fast)
  if (completion && completion !== caption && isAILoading) {
      setCaption(completion);
  }

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) setPlatforms(platforms.filter((p) => p !== platform));
    else setPlatforms([...platforms, platform]);
  };

  const submitPost = async (status: 'published' | 'scheduled', dateToSave: string | null) => {
    // ... (This function stays exactly the same as before) ...
    if (!file) return;
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('Videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('Posts').insert({
          user_id: user.id,
          caption: caption,
          video_url: fileData.path,
          platforms: platforms,
          status: status,
          scheduled_at: dateToSave
        });

      if (dbError) throw dbError;

      if (status === 'scheduled') router.push("/calendar");
      else router.push("/dashboard");

    } catch (error: any) {
      console.error("Error:", error);
      alert("Error: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-white">Create New Post</h1>

      <form className="space-y-8 bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl relative">
        {/* Loading Overlay (Same as before) */}
        {loading && (
          <div className="absolute inset-0 bg-[#1A1D21]/80 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
            <p className="text-white font-medium text-lg">Uploading Video...</p>
            <p className="text-slate-400 text-sm mt-2">Please do not close this page.</p>
          </div>
        )}

        {/* 1. Video Upload */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Video File</label>
          <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all relative group ${file ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center space-y-4">
               <div className={`p-4 rounded-full ${file ? 'bg-[#8B5CF6] text-white' : 'bg-[#141619] text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                 {file ? <Video className="w-8 h-8" /> : <CloudUpload className="w-8 h-8" />}
               </div>
               <div>
                 {file ? (
                   <p className="text-white font-medium text-lg">{file.name}</p>
                 ) : (
                   <>
                     <p className="text-slate-300 font-medium text-lg">Drag & drop or click to upload</p>
                     <p className="text-sm text-slate-500 mt-1">MP4, MOV up to 50MB</p>
                   </>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* 2. Caption Input with AI Button */}
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-300">Caption</label>
              {/* NEW: AI Generate Button */}
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={isAILoading || loading || !file}
                className="text-xs font-bold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1.5 bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full transition-all hover:bg-[#8B5CF6]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAILoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                )}
                {isAILoading ? "Writing..." : "Generate with AI"}
              </button>
          </div>
          <textarea
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading || isAILoading}
            className="w-full p-4 rounded-xl border border-white/10 bg-[#141619] text-white placeholder:text-slate-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all resize-none disabled:opacity-50"
            placeholder="Write something engaging..."
          />
        </div>

        {/* 3. Platforms & 4. Scheduling (Same as before, just need to be here for full file) */}
        {/* ... (Copy the rest of the form from previous version if needed, or use full file below) ... */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Select Platforms</label>
          <div className="flex flex-wrap gap-3">
            {["TikTok", "Instagram", "YouTube", "Facebook"].map((platform) => (
              <button
                key={platform}
                type="button"
                disabled={loading}
                onClick={() => handlePlatformToggle(platform)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  platforms.includes(platform)
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
                    : 'bg-[#141619] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
             <Calendar className="w-4 h-4 text-slate-500" />
             Schedule for later (Optional)
          </label>
          <input
             type="datetime-local"
             value={scheduledAt}
             onChange={(e) => setScheduledAt(e.target.value)}
             disabled={loading}
             className="w-full sm:w-auto p-3 rounded-xl border border-white/10 bg-[#141619] text-slate-300 outline-none focus:border-[#8B5CF6] transition-all [color-scheme:dark] disabled:opacity-50"
          />
        </div>

        <div className="flex gap-4 pt-6">
           <button
            type="button"
            onClick={(e) => { e.preventDefault(); submitPost('scheduled', new Date(scheduledAt).toISOString()) }}
            disabled={loading || !file || !scheduledAt}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Calendar className="w-5 h-5" />
            Schedule
          </button>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); submitPost('published', new Date().toISOString()) }}
            disabled={loading || !file || platforms.length === 0}
            className="flex-[2] flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#8B5CF6]/20 hover:shadow-xl hover:shadow-[#8B5CF6]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Post Now
          </button>
        </div>

      </form>
    </div>
  );
}