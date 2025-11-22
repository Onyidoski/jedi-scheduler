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

// New helper to get creator info (Mandatory step)
async function getCreatorInfo(accessToken: string) {
  const response = await fetch(`${TIKTOK_OPEN_API}/post/publish/creator_info/query/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({}) // Empty body required
  });

  const data = await response.json();
  if (data.error && data.error.code !== 'ok') {
    throw new Error(`Failed to query creator info: ${data.error.message}`);
  }
  return data.data;
}

export async function publishVideoToTikTok(accessToken: string, videoUrl: string, title: string) {
  // 1. MANDATORY: Query Creator Info first
  // TikTok requires this call to validate permissions and privacy settings before allowing a post init.
  const creatorInfo = await getCreatorInfo(accessToken);
  
  // Check if user can post (e.g. not banned)
  // We also get the valid privacy levels here. 
  // For unaudited apps, it usually forces 'SELF_ONLY' or 'MUTUAL_FOLLOW_FRIENDS'.
  // We will default to 'SELF_ONLY' to be safe, as 'PUBLIC_TO_EVERYONE' often fails for new apps.
  const privacyLevel = 'SELF_ONLY'; 

  // 2. Fetch the file from Supabase
  const fileResponse = await fetch(videoUrl);
  if (!fileResponse.ok) throw new Error("Failed to download video from Supabase");
  
  const videoBlob = await fileResponse.blob();
  const videoSize = videoBlob.size;

  // 3. Initialize the upload
  const initResponse = await fetch(`${TIKTOK_OPEN_API}/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: title.substring(0, 2200),
        privacy_level: privacyLevel,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
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

  if (initData.error && initData.error.code !== 'ok') {
    console.error("TikTok Init Error Details:", initData);
    throw new Error(`TikTok Init Failed: ${initData.error.message} (Log ID: ${initData.error.log_id})`);
  }

  const { upload_url, publish_id } = initData.data;

  // 4. Upload the video file
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