/**
 * Get the URL for a user's avatar image
 * This function prioritizes custom uploaded images over OAuth provider images
 * and uses the optimized avatar endpoint to avoid payload bloat
 * 
 * @param userId - The user's ID (required for custom images via API endpoint)
 * @param image - OAuth provider image URL (from Google/GitHub)
 * @param cacheBuster - Optional timestamp or version for cache invalidation (defaults to current time to prevent stale caches)
 * @returns The avatar URL or null if no image is available
 */
export function getAvatarUrl(
  userId: string | null | undefined, 
  image: string | null | undefined,
  cacheBuster?: string | number
): string | null {
  if (!userId) {
    // If no userId, can only use OAuth image if available
    return image || null;
  }

  // Always use the dedicated avatar endpoint which handles priority:
  // 1. Custom uploaded image (if exists)
  // 2. OAuth provider image (if exists)
  // 3. 404 if neither exists
  // Add cache buster to prevent stale cached images (especially after upload/delete)
  const timestamp = cacheBuster !== undefined ? cacheBuster : Date.now();
  return `/api/users/${userId}/avatar?v=${timestamp}`;
}

/**
 * Get initials from a name for fallback avatar display
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Custom event name for avatar refresh events
 * Used to trigger re-fetching of paddler lists when profile pictures change
 */
const AVATAR_REFRESH_EVENT = 'avatarRefresh'

/**
 * Trigger a refresh of paddler lists to update avatar images
 * This should be called after uploading or deleting profile pictures
 * to ensure EventList and PaddlerList components show updated avatars
 */
export function triggerAvatarRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AVATAR_REFRESH_EVENT))
  }
}

/**
 * Subscribe to avatar refresh events
 * @param callback Function to call when avatars should be refreshed
 * @returns Cleanup function to remove the event listener
 */
export function onAvatarRefresh(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {} // No-op for SSR
  }
  
  window.addEventListener(AVATAR_REFRESH_EVENT, callback)
  return () => {
    window.removeEventListener(AVATAR_REFRESH_EVENT, callback)
  }
}
