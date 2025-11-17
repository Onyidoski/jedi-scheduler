"use client";

import { createClient } from "@/lib/supabase/client";
import { Calendar, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiCaptionHelper } from "@/components/AiCaptionHelper";
// 1. Import the new VideoUploader
import { VideoUploader } from "@/components/VideoUploader";

export default function CreatePostPage() {
  const [caption, setCaption] = useState("");
  // 2. Change 'file' state to store the *result* of the upload
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false); // This is for DB save
  const [isUploading, setIsUploading] = useState(false); // This is for file upload

  const router = useRouter();
  const supabase = createClient();

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) setPlatforms(platforms.filter((p) => p !== platform));
    else setPlatforms([...platforms, platform]);
  };

  // 3. This function is passed to the uploader component
  const handleUploadSuccess = (filePath: string, originalName: string) => {
    setVideoUrl(filePath); // Store the Supabase path
  };

  // 4. Simplified submitPost function
  const submitPost = async (status: 'published' | 'scheduled', dateToSave: string | null) => {
    // We now check for videoUrl, not file
    if (!videoUrl) {
      alert("Please upload a video first."); // We can replace this with a modal later
      return;
    }
    
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in.");

      // 5. No more upload logic here! We just save to the database.
      const { error: dbError } = await supabase.from('Posts').insert({
          user_id: user.id,
          caption: caption,
          video_url: videoUrl, // Use the path from our state
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

  // We disable the form if *either* the uploader is busy or the form is submitting
  const isBusy = loading || isUploading;

  return (
    <div className="max-w-3xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-white">Create New Post</h1>

      {/* We no longer need the <form> tag to wrap everything */}
      <div className="space-y-8 bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl relative">

          {/* Loading Overlay for *saving* (upload has its own) */}
          {loading && (
            <div className="absolute inset-0 bg-[#1A1D21]/80 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
              <p className="text-white font-medium text-lg">Saving Post...</p>
              <p className="text-slate-400 text-sm mt-2">Please do not close this page.</p>
            </div>
          )}
  
          {/* 6. Replace the old Video Upload div with our new component */}
          <VideoUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadStart={() => setIsUploading(true)}
            onUploadEnd={() => setIsUploading(false)}
          />

        {/* 2. Caption Input */}
        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Caption</label>
          <textarea
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isBusy}
            className="w-full p-4 rounded-xl border border-white/10 bg-[#141619] text-white placeholder:text-slate-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all resize-none disabled:opacity-50"
            placeholder="Write something engaging... or use the AI helper below!"
          />
        </div>

        {/* 3. AI CAPTION HELPER - INTEGRATED! */}
        <div className="border-t border-white/5 pt-8">
          <AiCaptionHelper setMainCaption={setCaption} />
        </div>


        {/* 4. Platforms */}
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-300">Select Platforms</label>
            <div className="flex flex-wrap gap-3">
              {["TikTok", "Instagram", "YouTube", "Facebook"].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  disabled={isBusy}
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
  
          {/* 5. Scheduling */}
          <div className="pt-6 border-t border-white/5">
            <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
               <Calendar className="w-4 h-4 text-slate-500" />
               Schedule for later (Optional)
            </label>
            <input
               type="datetime-local"
               value={scheduledAt}
               onChange={(e) => setScheduledAt(e.target.value)}
               disabled={isBusy}
               className="w-full sm:w-auto p-3 rounded-xl border border-white/10 bg-[#141619] text-slate-300 outline-none focus:border-[#8B5CF6] transition-all [color-scheme:dark] disabled:opacity-50"
            />
          </div>
  
          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
             <button
              type="button"
              onClick={(e) => { e.preventDefault(); submitPost('scheduled', new Date(scheduledAt).toISOString()) }}
              disabled={isBusy || !videoUrl || !scheduledAt}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
  
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); submitPost('published', new Date().toISOString()) }}
              disabled={isBusy || !videoUrl || platforms.length === 0}
              className="flex-[2] flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-[#8B5CF6]/20 hover:shadow-xl hover:shadow-[#8B5CF6]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              Post Now
            </button>
          </div>

      </div>
    </div>
  );
}