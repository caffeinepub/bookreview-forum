/**
 * Safely generates the UTM content parameter for caffeine.ai referral links.
 * Uses window.location.hostname when available (browser context),
 * falls back to 'unknown-app' during build or non-browser contexts.
 */
export function getReferralUtmContent(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return encodeURIComponent(window.location.hostname);
  }
  return 'unknown-app';
}
