import { VideoCard } from "@/components/video-card";
import { createClient } from "@/lib/supabase/server";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  // Fetch ONLY 'scheduled' posts, ordered by SOONEST first
  const { data: scheduledPostsData, error } = await supabase
    .from("Posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  // Pre-calculate Signed URLs for the video cards
  const scheduledPosts = await Promise.all(
    (scheduledPostsData || []).map(async (post) => {
      const { data } = await supabase.storage.from("Videos").createSignedUrl(post.video_url, 3600);
      return { ...post, signedUrl: data?.signedUrl };
    })
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-[#8B5CF6]" />
            Content Calendar
          </h1>
          <p className="text-slate-400 mt-1">Your upcoming scheduled content.</p>
        </div>
        <Link
          href="/create"
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
        >
          + Schedule New
        </Link>
      </div>

      {/* --- Empty State --- */}
      {scheduledPosts.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-3xl bg-[#1A1D21]/50">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-2">No upcoming posts</h3>
          <p className="text-slate-400 mb-8">Schedule a post to see it appear here.</p>
          <Link href="/create" className="text-[#8B5CF6] hover:text-[#A78BFA] font-bold flex items-center justify-center gap-2">
            Schedule a post →
          </Link>
        </div>
      )}

      {/* --- Agenda View --- */}
      <div className="space-y-8">
        {scheduledPosts.map((post) => {
          const date = new Date(post.scheduled_at);

          return (
            <div key={post.id} className="flex flex-col md:flex-row gap-6 group">
              {/* 1. Date Block (Left Side) */}
              <div className="md:w-32 shrink-0 flex md:flex-col items-center md:items-start gap-3 md:gap-1">
                 <span className="text-sm font-bold uppercase text-[#8B5CF6] tracking-wider">
                   {date.toLocaleString('default', { month: 'short' })}
                 </span>
                 <span className="text-4xl md:text-5xl font-extrabold text-white leading-none">
                   {date.getDate()}
                 </span>
                 <span className="text-sm font-medium text-slate-500 uppercase">
                   {date.toLocaleString('default', { weekday: 'long' })}
                 </span>
                 <div className="hidden md:block h-full w-px bg-white/10 mt-4 mx-auto md:mx-4"></div>
              </div>

              {/* 2. Content Card (Right Side) */}
              <div className="flex-1 bg-[#1A1D21] rounded-2xl border border-white/5 p-6 hover:border-[#8B5CF6]/30 transition-all grid grid-cols-1 lg:grid-cols-5 gap-6">
                 {/* Video Preview (Takes up 2 columns on large screens) */}
                 <div className="lg:col-span-2">
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      {/* Minimal mode for Calendar */}
                      <VideoCard post={post} minimal />
                    </div>
                 </div>

                 {/* Details (Takes up 3 columns) */}
                 <div className="lg:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-[#8B5CF6]">
                       <Clock className="w-4 h-4" />
                       {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <h3 className="text-xl font-bold text-white line-clamp-2 mb-4">
                       {post.caption || <span className="italic text-slate-500">Untitled Post</span>}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(post.platforms as string[])?.map((p) => (
                        <span key={p} className="bg-[#2D3139] text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide">
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="bg-[#FACC15] text-black text-[10px] font-extrabold px-2 py-1 rounded-sm uppercase">
                         SCHEDULED
                       </span>
                       {/* Functional Edit Link */}
                       <Link
                         href={`/edit/${post.id}`}
                         className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                       >
                         Edit Details →
                       </Link>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}