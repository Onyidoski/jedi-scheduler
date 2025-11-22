import { createClient } from "@/lib/supabase/server";
import { publishVideoToTikTok, refreshTikTokToken } from "@/lib/tiktok";
import { NextResponse } from "next/server";

// Increase timeout for this route since it involves external API calls
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Fetch Post Details
    const { data: post } = await supabase
      .from('Posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // 3. Fetch TikTok Connection
    const { data: connection } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single();

    if (!connection) return NextResponse.json({ error: "TikTok not connected" }, { status: 400 });

    // 4. Check Token Expiry & Refresh if needed
    let accessToken = connection.access_token;
    const expiresAt = new Date(connection.expires_at);
    // Refresh if expired or expires in less than 5 minutes
    if (expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
      console.log("Refreshing TikTok token...");
      accessToken = await refreshTikTokToken(user.id, connection.refresh_token);
    }

    // 5. Generate a Signed URL for the video
    // TikTok needs a publicly accessible URL to download the video.
    // A signed URL from Supabase works perfectly for this.
    const { data: signedUrlData, error: signedError } = await supabase
      .storage
      .from('Videos')
      .createSignedUrl(post.video_url, 3600); // Valid for 1 hour

    if (signedError || !signedUrlData?.signedUrl) {
      throw new Error("Failed to generate video URL");
    }

    // 6. Publish to TikTok
    const result = await publishVideoToTikTok(
      accessToken,
      signedUrlData.signedUrl,
      post.caption
    );

    // 7. Update Post Status in DB
    // Note: 'publish_id' allows checking status later, but for now we assume success if no error thrown
    await supabase
      .from('Posts')
      .update({ 
        status: 'published',
        platform_post_id: result.publish_id 
      })
      .eq('id', postId);

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("Publish Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}