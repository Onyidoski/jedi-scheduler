import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PLATFORMS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/connect/tiktok?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/connect/tiktok?error=No+code+provided', request.url));
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('tiktok_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    const response = NextResponse.redirect(new URL('/connect/tiktok?error=Invalid+state', request.url));
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    return response;
  }

  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY!;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI!;

    const tokenParams = new URLSearchParams();
    tokenParams.append('client_key', clientKey);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('code', code);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', redirectUri);

    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to exchange token');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { access_token, refresh_token, open_id, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    let tiktokUsername = 'Connected User';
    try {
        const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const userData = await userResponse.json();
        if (userData.data && userData.data.user) {
            tiktokUsername = userData.data.user.display_name;
        }
    } catch (e) {
        // Fail silently for username fetch
    }

    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: PLATFORMS.TIKTOK,
        platform_user_id: open_id,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: expiresAt.toISOString(),
        scopes: ['video.upload', 'video.publish'],
        platform_username: tiktokUsername 
      }, {
        onConflict: 'user_id, platform'
      });

    if (dbError) throw dbError;

    const response = NextResponse.redirect(new URL('/connect/tiktok', request.url));
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    return response;

  } catch (err: any) {
    const response = NextResponse.redirect(new URL(`/connect/tiktok?error=${encodeURIComponent(err.message)}`, request.url));
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    return response;
  }
}