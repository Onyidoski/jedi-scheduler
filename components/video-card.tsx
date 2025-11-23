"use client";

import { createClient } from "@/lib/supabase/client";
import { Play, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Needed to render modal on top

interface VideoCardProps {
  post: any;
  minimal?: boolean;
}

export function VideoCard({ post, minimal = false }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // --- Delete States ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Portal check
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  // Open Modal
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsDeleteModalOpen(true);
  };

  // Actual Delete Action
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Delete from Storage
      if (post.video_url) {
        await supabase.storage.from('Videos').remove([post.video_url]);
      }
      // 2. Delete from Database
      const { error } = await supabase.from('Posts').delete().eq('id', post.id);
      if (error) throw error;

      // 3. Close and Refresh
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Error deleting post. Please try again."); // Fallback
      setIsDeleting(false);
    }
  };

  return (
    <>
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

          {/* --- NEW: Professional Delete Button (Top Left) --- */}
          <button 
            onClick={handleDeleteClick}
            className="absolute top-3 left-3 z-20 p-2 bg-black/50 hover:bg-red-600/80 text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
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

      {/* --- PORTAL MODAL (Renders outside the card overflow) --- */}
      {mounted && isDeleteModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-[#1A1D21] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              This action cannot be undone. The video and its details will be permanently removed from your dashboard.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-[#2A2D35] text-slate-300 hover:text-white hover:bg-[#3A3D45] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}