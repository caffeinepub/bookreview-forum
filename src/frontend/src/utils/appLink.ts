/**
 * Safely derives the current app URL at runtime.
 * Guards against non-browser contexts (build time, SSR, etc.).
 */

/**
 * Returns the app's origin (e.g., "https://example.com") if available.
 * Returns null in non-browser contexts.
 */
export function getAppOrigin(): string | null {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return null;
}

/**
 * Returns the full current URL if available.
 * Returns null in non-browser contexts.
 */
export function getAppUrl(): string | null {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }
  return null;
}
