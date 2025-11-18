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

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/settings?error=Invalid+state', request.url));
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
    const { access_token, refresh_token, open_id, expires_in } = tokenData.data;
    
    // Calculate expiry date
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Optional: Fetch username to display in settings
    // (We skip this for now to keep it simple, we can add it later)

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
        platform_username: 'Connected User' // Placeholder for now
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
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(err.message)}`, request.url));
  }
}