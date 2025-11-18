import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // --- THIS IS THE FIX ---
  // We must 'await' the cookies() function
  const cookieStore = await cookies();
  // --- END FIX ---
  
  const savedState = cookieStore.get('tiktok_oauth_state')?.value;

  // 1. Security Check: Verify the 'state' param
  if (!state || !savedState || state !== savedState) {
    // --- FIX: We must delete the cookie even if we fail ---
    const response = NextResponse.json({ error: 'Invalid state parameter.' }, { status: 400 });
    response.cookies.set('tiktok_oauth_state', '', { maxAge: -1 }); // Delete cookie
    return response;
    // --- END FIX ---
  }
  
  // --- FIX: We remove the .delete() line from here ---
  // cookieStore.delete('tiktok_oauth_state'); // This was incorrect

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // --- THIS IS THE FIX ---
  // We read the keys from process.env WITHOUT NEXT_PUBLIC_
  const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
  const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
  const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;
  // --- END FIX ---

  try {
    // 2. Exchange the code for an access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_key', TIKTOK_CLIENT_KEY!);
    tokenParams.append('client_secret', TIKTOK_CLIENT_SECRET!);
    tokenParams.append('code', code);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', TIKTOK_REDIRECT_URI!);

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`TikTok Token Error: ${tokenData.error_description}`);
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
      open_id, // This is the user's TikTok ID
    } = tokenData.data;

    // 3. Get the Supabase user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated.");
    }
    
    // 4. (Optional but recommended) Get the user's TikTok username
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_large_url', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const userData = await userResponse.json();
    const tiktokUsername = userData.data.user?.display_name || 'Unknown';


    // 5. Save the tokens securely in our new database table
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: open_id,
        platform_username: tiktokUsername,
        access_token: access_token, // TODO: Encrypt this!
        refresh_token: refresh_token, // TODO: Encrypt this!
        expires_at: expiresAt.toISOString(),
        scopes: scope.split(','),
      }, {
        onConflict: 'user_id, platform' // Update if it already exists
      });

    if (dbError) throw dbError;

    // 6. Redirect the user back to the settings page
    // --- FIX: We create the response first, then delete the cookie ---
    const response = NextResponse.redirect(new URL('/settings', request.url));
    response.cookies.set('tiktok_oauth_state', '', {
      path: '/',
      httpOnly: true,
      maxAge: -1 // Setting maxAge to -1 or 0 tells the browser to delete it
    });
    return response;
    // --- END FIX ---

  } catch (error: any) {
    console.error('TikTok Callback Error:', error);
    // Redirect back to settings with an error message
    const errorUrl = new URL('/settings', request.url);
    errorUrl.searchParams.append('error', error.message);
    
    // --- FIX: Also delete the cookie on error ---
    const response = NextResponse.redirect(errorUrl);
    response.cookies.set('tiktok_oauth_state', '', {
      path: '/',
      httpOnly: true,
      maxAge: -1
    });
    return response;
    // --- END FIX ---
  }
}