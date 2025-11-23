'use server'

import { createClient } from "@/lib/supabase/server";
import { PLATFORMS } from "@/lib/constants";
import { publishVideoToTikTok, refreshTikTokToken } from "@/lib/tiktok";
import { revalidatePath } from "next/cache";

export type CreatePostState = {
  message: string | null;
  error: string | null;
  postId?: string;
}

export async function createPostAction(
  prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const supabase = await createClient();
  
  try {
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: null, error: "Unauthorized" };

    // 2. Parse Data
    const caption = formData.get('caption') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const scheduledAtRaw = formData.get('scheduledAt') as string;
    const platformsRaw = formData.get('platforms') as string;
    const platforms = platformsRaw ? JSON.parse(platformsRaw) : [];
    
    // Determine initial status. 
    // If publishing now, we still start as 'processing' to be safe, 
    // but we will update it to 'published' before this action finishes.
    let status = scheduledAtRaw ? 'scheduled' : 'processing';
    const scheduledAt = scheduledAtRaw || null;

    // 3. Insert to Database
    const { data: post, error: insertError } = await supabase
      .from('Posts')
      .insert({
        user_id: user.id,
        caption,
        video_url: videoUrl,
        platforms,
        status,
        scheduled_at: scheduledAt
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // 4. Handle Immediate Publishing (TikTok)
    if (!scheduledAt && platforms.includes('TikTok')) {
      try {
        // A. Get Connection
        const { data: connection } = await supabase
          .from('social_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', 'tiktok')
          .single();

        if (!connection) throw new Error("TikTok account not connected");

        // B. Refresh Token if needed
        let accessToken = connection.access_token;
        const expiresAt = new Date(connection.expires_at);
        if (expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
          accessToken = await refreshTikTokToken(user.id, connection.refresh_token);
        }

        // C. Get Signed URL for the video file
        const { data: signedUrlData, error: signedError } = await supabase
          .storage
          .from('Videos')
          .createSignedUrl(videoUrl, 3600);

        if (signedError || !signedUrlData?.signedUrl) {
          throw new Error("Failed to generate video URL");
        }

        // D. Publish to TikTok
        const result = await publishVideoToTikTok(
          accessToken,
          signedUrlData.signedUrl,
          caption
        );

        // E. Update Post Status to 'published'
        const { error: updateError } = await supabase
          .from('Posts')
          .update({ 
            status: 'published',
            platform_post_id: result.publish_id 
          })
          .eq('id', post.id);
          
        if (updateError) throw updateError;

      } catch (publishError: any) {
        console.error("Publishing failed:", publishError);
        // We don't fail the whole action, but we return the error so the UI knows
        // The post remains in 'processing' state in DB so user can retry
        return { message: "saved_draft", error: "Post saved, but TikTok publishing failed: " + publishError.message, postId: post.id };
      }
    }

    // 5. Revalidate Dashboard so new data shows up immediately
    revalidatePath('/dashboard');
    revalidatePath('/calendar');

    return { message: "success", error: null, postId: post.id };

  } catch (error: any) {
    return { message: null, error: error.message };
  }
}