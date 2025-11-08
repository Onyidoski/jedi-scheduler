import { VideoCard } from "@/components/video-card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

// Accept searchParams prop to read the URL (e.g., ?filter=scheduled)
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  // Await the searchParams before using them (Next.js 15+ requirement)
  const { filter } = await searchParams;
  // Default to 'all' if no filter is set
  const activeFilter = filter || 'all';

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  // --- 1. Build Dynamic Query ---
  // Start with base query
  let query = supabase
    .from("Posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Apply filter if it's not 'all'
  if (activeFilter === 'scheduled') {
    query = query.eq('status', 'scheduled');
  } else if (activeFilter === 'published') {
    query = query.eq('status', 'published');
  }

  // Execute the query
  const { data: postsData, error: postsError } = await query;

  // --- 2. Pre-calculate Signed URLs ---
  const posts = await Promise.all(
    (postsData || []).map(async (post) => {
      const { data } = await supabase.storage.from("Videos").createSignedUrl(post.video_url, 3600);
      return { ...post, signedUrl: data?.signedUrl };
    })
  );

  return (
    <div>
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Content Overview</p>
        </div>
        <Link
          href="/create"
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
        >
          + Create New Post
        </Link>
      </div>

      {/* --- NEW: Filter Tabs --- */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        <FilterTab current={activeFilter} filter="all" label="All Posts" />
        <FilterTab current={activeFilter} filter="scheduled" label="Scheduled" />
        <FilterTab current={activeFilter} filter="published" label="Published" />
      </div>

      {/* --- Video Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <VideoCard key={post.id} post={post} />
          ))
        ) : (
          // Empty state specific to the filter
          <div className="col-span-full py-20 text-center text-slate-500 bg-[#1A1D21] rounded-2xl border border-white/5">
            No {activeFilter === 'all' ? '' : activeFilter} posts found.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper Component for Filter Tabs ---
function FilterTab({ current, filter, label }: { current: string; filter: string; label: string }) {
  const isActive = current === filter;
  return (
    <Link
      href={filter === 'all' ? '/dashboard' : `/dashboard?filter=${filter}`}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive
          ? "bg-white text-[#141619]"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}