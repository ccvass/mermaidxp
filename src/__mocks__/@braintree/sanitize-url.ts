/**
 * Mock for @braintree/sanitize-url
 * Provides a simple implementation for tests
 */

export function sanitizeUrl(url: string): string {
  // Simple implementation for tests
  if (!url || typeof url !== 'string') {
    return 'about:blank';
  }

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return 'about:blank';
    }
  }

  return url;
}

export default { sanitizeUrl };
