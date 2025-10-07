/**
 * Mock para @braintree/sanitize-url
 * Proporciona una implementación simple para tests
 */

export function sanitizeUrl(url: string): string {
  // Implementación simple para tests
  if (!url || typeof url !== 'string') {
    return 'about:blank';
  }

  // Remover protocolos peligrosos
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
