/**
 * Runtime configuration helper for Internet Identity authentication.
 * Computes production-safe identityProvider and derivationOrigin values
 * with robust fallbacks for various deployment scenarios.
 */

const II_MAINNET_URL = 'https://identity.ic0.app';
const II_LOCAL_URL = 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943';

interface InternetIdentityConfig {
  identityProvider: string;
  derivationOrigin?: string;
}

/**
 * Determines if we're running in a local development environment
 */
function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
}

/**
 * Gets the appropriate Internet Identity provider URL
 */
function getIdentityProvider(): string {
  // Check environment variable first
  const envProvider = process.env.II_URL;
  if (envProvider && envProvider.trim() !== '') {
    return envProvider;
  }

  // Fallback based on environment
  return isLocalEnvironment() ? II_LOCAL_URL : II_MAINNET_URL;
}

/**
 * Gets the derivation origin if needed for the current deployment
 * For production IC deployments, this should match the canister URL pattern
 */
function getDerivationOrigin(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // Check if explicitly configured
  const envDerivation = process.env.II_DERIVATION_ORIGIN;
  if (envDerivation && envDerivation.trim() !== '') {
    return envDerivation;
  }

  // For local development, no derivation origin needed
  if (isLocalEnvironment()) {
    return undefined;
  }

  // For production IC deployments, use the current origin
  // This handles both direct canister URLs and custom domains
  const origin = window.location.origin;
  
  // Only set derivation origin for IC canister URLs
  if (origin.includes('.ic0.app') || origin.includes('.icp0.io') || origin.includes('.raw.icp0.io')) {
    return origin;
  }

  return undefined;
}

/**
 * Gets the complete Internet Identity configuration for the current environment
 */
export function getInternetIdentityConfig(): InternetIdentityConfig {
  const identityProvider = getIdentityProvider();
  const derivationOrigin = getDerivationOrigin();

  console.log('[II Config]', {
    identityProvider,
    derivationOrigin,
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    isLocal: isLocalEnvironment()
  });

  return {
    identityProvider,
    derivationOrigin
  };
}
