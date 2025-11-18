import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    return NextResponse.json({ error: 'TikTok configuration missing' }, { status: 500 });
  }

  // 1. Generate a random state string for security (CSRF protection)
  const state = crypto.randomUUID();

  // 2. Create the redirect response
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.append('client_key', clientKey);
  url.searchParams.append('scope', 'user.info.basic,video.upload,video.publish');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('state', state);

  const response = NextResponse.redirect(url.toString());

  // 3. Save the state in a cookie to verify later
  response.cookies.set('tiktok_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}