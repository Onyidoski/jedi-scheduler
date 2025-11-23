"use client";

import { Calendar, Loader2, Send, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AiCaptionHelper } from "@/components/AiCaptionHelper";
import { VideoUploader } from "@/components/VideoUploader";
import { createPostAction } from "@/app/actions";

export default function CreatePostPage() {
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();

  const handlePlatformToggle = (platform: string) => {
    if (platforms.includes(platform)) setPlatforms(platforms.filter((p) => p !== platform));
    else setPlatforms([...platforms, platform]);
  };

  // --- FIX: Dynamic Status Message ---
  const getStatusMessage = () => {
    if (scheduledAt) return "Scheduling...";
    // Only say "Publishing to TikTok" if TikTok is actually one of the selected platforms
    if (platforms.includes("TikTok")) return "Publishing to TikTok...";
    return "Publishing...";
  };

  const handleSubmit = async (e: React.FormEvent, type: 'published' | 'scheduled') => {
    e.preventDefault();
    setFormError(null);

    if (!videoUrl) {
      setFormError("Please upload a video first.");
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('videoUrl', videoUrl);
    formData.append('platforms', JSON.stringify(platforms));
    if (type === 'scheduled') formData.append('scheduledAt', new Date(scheduledAt).toISOString());

    startTransition(async () => {
      const result = await createPostAction({ message: null, error: null }, formData);

      if (result.error) {
        setFormError(result.error);
        return;
      }

      router.push(type === 'scheduled' ? "/calendar" : "/dashboard");
    });
  };

  const isBusy = isPending || isUploading;

  return (
    <div className="max-w-3xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-white">Create New Post</h1>

      <div className="space-y-8 bg-[#1A1D21] p-8 rounded-2xl border border-white/5 shadow-2xl relative">

          {isPending && (
            <div className="absolute inset-0 bg-[#1A1D21]/90 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
              <p className="text-white font-medium text-lg">
                 {/* FIX: Use the dynamic message function */}
                 {getStatusMessage()}
              </p>
              <p className="text-slate-400 text-sm mt-2">This may take a few moments.</p>
            </div>
          )}

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{formError}</p>
            </div>
          )}
  
          <VideoUploader 
            onUploadSuccess={(path) => setVideoUrl(path)}
            onUploadStart={() => setIsUploading(true)}
            onUploadEnd={() => setIsUploading(false)}
          />

        <div>
          <label className="block text-sm font-medium mb-3 text-slate-300">Caption</label>
          <textarea
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isBusy}
            className="w-full p-4 rounded-xl border border-white/10 bg-[#141619] text-white placeholder:text-slate-600 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all resize-none disabled:opacity-50"
            placeholder="Write something engaging..."
          />
        </div>

        <div className="border-t border-white/5 pt-8">
          <AiCaptionHelper setMainCaption={setCaption} />
        </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-slate-300">Select Platforms</label>
            <div className="flex flex-wrap gap-3">
              {["TikTok", "Instagram", "YouTube", "Facebook"].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all disabled:opacity-50 ${
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
               disabled={isBusy}
               className="w-full sm:w-auto p-3 rounded-xl border border-white/10 bg-[#141619] text-slate-300 outline-none focus:border-[#8B5CF6] transition-all [color-scheme:dark] disabled:opacity-50"
            />
          </div>
  
          <div className="flex gap-4 pt-6">
             <button
              type="button"
              onClick={(e) => handleSubmit(e, 'scheduled')}
              disabled={isBusy || !videoUrl || !scheduledAt}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
  
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'published')}
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