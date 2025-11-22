import { createClient } from "./supabase/server";

const TIKTOK_OPEN_API = 'https://open.tiktokapis.com/v2';

// Helper to refresh the access token if needed
export async function refreshTikTokToken(userId: string, currentRefreshToken: string) {
  const supabase = await createClient();
  
  const params = new URLSearchParams();
  params.append('client_key', process.env.TIKTOK_CLIENT_KEY!);
  params.append('client_secret', process.env.TIKTOK_CLIENT_SECRET!);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', currentRefreshToken);

  const response = await fetch(`${TIKTOK_OPEN_API}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Failed to refresh TikTok token: ${data.error_description}`);
  }

  // Update the tokens in the database
  const { access_token, refresh_token, expires_in, open_id } = data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  await supabase
    .from('social_connections')
    .update({
        access_token,
        refresh_token, // TikTok rotates refresh tokens too
        expires_at: expiresAt.toISOString()
    })
    .eq('user_id', userId)
    .eq('platform', 'tiktok');

  return access_token;
}

// Helper to initiate video upload (PULL_FROM_URL method is preferred for server-side)
export async function publishVideoToTikTok(accessToken: string, videoUrl: string, title: string) {
  // 1. Initialize the post
  // We use PULL_FROM_URL because the video is already hosted on Supabase (public or signed URL)
  // This avoids downloading the file to the Vercel server which might timeout.
  
  const initResponse = await fetch(`${TIKTOK_OPEN_API}/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: title.substring(0, 2200), // TikTok caption limit
        privacy_level: 'SELF_ONLY', // 'PUBLIC_TO_EVERYONE' requires passing an audit. Start with SELF_ONLY or FOLLOWER_OF_CREATOR
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl 
      }
    })
  });

  const initData = await initResponse.json();

  if (initData.error && initData.error.code !== 'ok') {
    throw new Error(`TikTok Init Failed: ${initData.error.message} (Log ID: ${initData.error.log_id})`);
  }

  return initData.data; // Contains publish_id
}