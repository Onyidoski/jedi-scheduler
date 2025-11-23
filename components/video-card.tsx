"use client";

import { createClient } from "@/lib/supabase/client";
import { Play, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface VideoCardProps {
  post: any;
  minimal?: boolean;
}

export function VideoCard({ post, minimal = false }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // --- NEW: Delete State ---
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoPlay = () => setIsPlaying(true);

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- NEW: Handle Delete Logic ---
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent play click if overlapping
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

    setIsDeleting(true);
    try {
      // 1. Delete from Storage
      if (post.video_url) {
        await supabase.storage.from('Videos').remove([post.video_url]);
      }
      // 2. Delete from Database
      const { error } = await supabase.from('Posts').delete().eq('id', post.id);
      if (error) throw error;

      // 3. Refresh UI
      router.refresh();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Could not delete post.");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group bg-[#1A1D21] rounded-xl overflow-hidden border border-white/5 ${!minimal && 'hover:border-[#8B5CF6]/50'} transition-all relative`}>
      
      {/* Video Thumbnail Area */}
      <div className="aspect-video bg-black relative">
        {post.signedUrl && (
          <video
            ref={videoRef}
            src={post.signedUrl}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            preload="metadata"
            controls={isPlaying}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoPause}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
        
        {!isPlaying && (
          <button 
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/20 group-hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
               <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </button>
        )}
        
        {/* Status Badge (Top Right) */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-sm uppercase ${
            post.status === 'scheduled' ? 'bg-[#FACC15] text-black' : 'bg-emerald-500 text-black'
          }`}>
            {post.status === 'scheduled' ? 'SCHEDULED' : post.status}
          </span>
        </div>

        {/* --- NEW: Delete Button (Top Left) --- */}
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-3 left-3 z-20 p-2 bg-black/50 hover:bg-red-600/80 text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-100"
          title="Delete Post"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Area */}
      {!minimal && (
        <div className="p-5">
          <h3 className="text-white font-medium line-clamp-1 mb-4">
            {post.caption || "Untitled post"}
          </h3>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(post.platforms as string[])?.map((p) => (
                 <span key={p} className="bg-[#8B5CF6] text-white text-[10px] font-bold px-3 py-1 rounded-md capitalize">
                   {p}
                 </span>
              ))}
            </div>
            <div className="text-right">
               <p className="text-slate-400 text-xs font-mono">
                 {formatTime(duration)}
               </p>
               {isPlaying && (
                 <p className="text-[#8B5CF6] text-xs font-mono">
                   {formatTime(currentTime)}
                 </p>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}