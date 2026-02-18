/**
 * Build information utility
 * Provides a safe way to read build identifiers from environment variables
 */

export interface BuildInfo {
  version: string;
  timestamp: string;
  identifier: string;
}

/**
 * Get build information from Vite environment variables
 * Falls back to safe defaults if not available
 */
export function getBuildInfo(): BuildInfo {
  // Vite exposes import.meta.env for environment variables
  const buildTimestamp = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUILD_TIMESTAMP 
    ? import.meta.env.VITE_BUILD_TIMESTAMP 
    : new Date().toISOString();

  const buildVersion = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUILD_VERSION
    ? import.meta.env.VITE_BUILD_VERSION
    : 'dev';

  // Create a short identifier from timestamp for easy verification
  const identifier = buildTimestamp.slice(0, 16).replace(/[-:T]/g, '');

  return {
    version: buildVersion,
    timestamp: buildTimestamp,
    identifier,
  };
}

/**
 * Get a short build identifier for display
 * Format: v{version}-{short-timestamp}
 */
export function getBuildIdentifier(): string {
  const info = getBuildInfo();
  return `v${info.version}-${info.identifier}`;
}
