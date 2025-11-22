import { createClient } from "./supabase/server";

const TIKTOK_OPEN_API = 'https://open.tiktokapis.com/v2';

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

  const { access_token, refresh_token, expires_in } = data;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  await supabase
    .from('social_connections')
    .update({
        access_token,
        refresh_token, 
        expires_at: expiresAt.toISOString()
    })
    .eq('user_id', userId)
    .eq('platform', 'tiktok');

  return access_token;
}

export async function publishVideoToTikTok(accessToken: string, videoUrl: string, title: string) {
  // --- FIX: FORCE 'SELF_ONLY' FOR UNAUDITED APPS ---
  // We hardcode this because unaudited apps cannot post publicly.
  const selectedPrivacy = 'SELF_ONLY';
  
  console.log(`Enforcing Privacy Level: ${selectedPrivacy}`);

  // 1. Fetch the file from Supabase
  const fileResponse = await fetch(videoUrl);
  if (!fileResponse.ok) throw new Error("Failed to download video from Supabase");
  
  const videoBlob = await fileResponse.blob();
  const videoSize = videoBlob.size;

  // 2. Initialize the upload
  const initResponse = await fetch(`${TIKTOK_OPEN_API}/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: title.substring(0, 2200),
        privacy_level: selectedPrivacy, // Hardcoded to SELF_ONLY
        disable_duet: true,
        disable_comment: true,
        disable_stitch: true,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: videoSize,
        chunk_size: videoSize,
        total_chunk_count: 1
      }
    })
  });

  const initData = await initResponse.json();

  // Error Handling
  if (initData.error && initData.error.code !== 'ok') {
    console.error("TikTok Init Failed:", initData);
    
    if (initData.error.code === 'unaudited_client_can_only_post_to_private_accounts') {
        throw new Error("Dev Mode Restriction: You must set your TikTok account to 'Private' in the app settings to test posting.");
    }
    
    throw new Error(`TikTok Init Failed: ${initData.error.message}`);
  }

  const { upload_url, publish_id } = initData.data;

  // 3. Upload the video file
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
      'Content-Length': videoSize.toString()
    },
    body: videoBlob
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`TikTok Upload Failed: ${errorText}`);
  }

  return { publish_id };
}