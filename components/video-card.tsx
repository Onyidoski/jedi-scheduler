"use client";

import { Play } from "lucide-react";
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

  return (
    <div className={`group bg-[#1A1D21] rounded-xl overflow-hidden border border-white/5 ${!minimal && 'hover:border-[#8B5CF6]/50'} transition-all`}>
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
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-sm uppercase ${
            post.status === 'scheduled' ? 'bg-[#FACC15] text-black' : 'bg-emerald-500 text-black'
          }`}>
            {/* FIX IS HERE VVV */}
            {post.status === 'scheduled' ? 'SCHEDULED' : post.status}
          </span>
        </div>
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