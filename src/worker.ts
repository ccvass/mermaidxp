/**
 * Cloudflare Worker for MermaidXP
 * This worker serves the React SPA and can be extended with API endpoints
 */

export default {
  async fetch(_request: Request, _env: Record<string, string>): Promise<Response> {
    return new Response('Worker ready', { status: 200 });
  },
};
