/**
 * Optimizes Supabase Storage image URLs by appending transformation parameters.
 * For non-Supabase URLs, returns the original URL unchanged.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url) return "/placeholder.svg";

  const { width = 640, quality = 75 } = options;

  // Supabase Storage URLs support render transforms
  if (url.includes("supabase.co/storage/v1/object/public/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}`;
  }

  return url;
}

/**
 * Standard sizes attribute for course card images in grid layouts.
 */
export const COURSE_CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
