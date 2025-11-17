import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This makes sure this route is not cached
export const dynamic = 'force-dynamic';

export async function GET() {
  const TIKTOK_CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  const TIKTOK_REDIRECT_URI = process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI;

  if (!TIKTOK_CLIENT_KEY || !TIKTOK_REDIRECT_URI) {
    throw new Error('TikTok environment variables are not set.');
  }
  
  // 2. This is a unique string to prevent attacks. We'll check it later.
  const state = crypto.randomUUID();

  // 3. These are the scopes we need
  const scopes = [
    'user.info.basic',
    'video.upload',
    'video.publish',
  ].join(',');

  // 4. Build the official TikTok login URL
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
  url.searchParams.append('client_key', TIKTOK_CLIENT_KEY);
  url.searchParams.append('scope', scopes);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', TIKTOK_REDIRECT_URI);
  url.searchParams.append('state', state);

  // 5. --- THIS IS THE FIX ---
  // First, create the redirect response
  const response = NextResponse.redirect(url.toString());

  // Second, set the state cookie ON that response
  response.cookies.set('tiktok_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
  });

  // Finally, return the response that contains both the redirect and the cookie
  return response;
}