import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/settings?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=No+code+provided', request.url));
  }

  // 1. Verify State (CSRF Protection)
  const cookieStore = await cookies();
  const storedState = cookieStore.get('tiktok_oauth_state')?.value;

  // Debugging logs (remove in production)
  console.log('Received state:', state);
  console.log('Stored state:', storedState);

  if (!state || !storedState || state !== storedState) {
    // Create response to delete the cookie and redirect with error
    const response = NextResponse.redirect(new URL('/settings?error=Invalid+state', request.url));
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    return response;
  }

  try {
    // 2. Exchange Code for Access Token
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

    // 3. Get the User from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // 4. Save to Database
    // FIX: TikTok v2 token endpoint returns fields at the root, not inside .data
    const { access_token, refresh_token, open_id, expires_in } = tokenData;
    
    // Calculate expiry date
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Optional: Fetch username to display in settings
    let tiktokUsername = 'Connected User';
    try {
        // Note: The User Info API *does* wrap its response in .data, so this part stays the same
        const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
          headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const userData = await userResponse.json();
        if (userData.data && userData.data.user) {
            tiktokUsername = userData.data.user.display_name;
        }
    } catch (e) {
        console.error("Failed to fetch user info", e);
    }

    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
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

    // 5. Success! Redirect back to settings
    const response = NextResponse.redirect(new URL('/settings', request.url));
    
    // Clean up the state cookie
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    
    return response;

  } catch (err: any) {
    console.error("TikTok Auth Error:", err);
    const response = NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(err.message)}`, request.url));
    // Clean up cookie on error too
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });
    return response;
  }
}