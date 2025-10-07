/**
 * Cloudflare Worker for MermaidXP
 * This worker serves the React SPA and can be extended with API endpoints
 */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // For now, just serve assets (React app)
    // You can add API endpoints here later if needed
    return new Response('Worker ready', { status: 200 });
  },
};
