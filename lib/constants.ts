export const BUCKET_NAME = 'Videos';

export const PLATFORMS = {
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
} as const;

export const PRIVACY_LEVELS = {
  SELF_ONLY: 'SELF_ONLY',
  PUBLIC: 'PUBLIC_TO_EVERYONE',
  FRIENDS: 'FRIENDS_ONLY',
} as const;

export const ERRORS = {
  UNAUTHORIZED: 'You must be logged in.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  MISSING_CONFIG: 'Server configuration missing.',
};