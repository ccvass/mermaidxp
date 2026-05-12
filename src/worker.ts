/**
 * Cloudflare Worker for MermaidXP
 * Handles API endpoints for diagram sharing via KV storage
 */

interface Env {
  DIAGRAMS: { get(key: string): Promise<string | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API: Save diagram
    if (url.pathname === '/api/share' && request.method === 'POST') {
      return handleShareCreate(request, env);
    }

    // API: Get shared diagram
    if (url.pathname.startsWith('/api/share/') && request.method === 'GET') {
      const id = url.pathname.slice('/api/share/'.length);
      return handleShareGet(id, env);
    }

    // API: Health check
    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok', timestamp: Date.now() });
    }

    // All other requests handled by Cloudflare static assets
    return new Response('Not found', { status: 404 });
  },
};

async function handleShareCreate(request: Request, env: Env): Promise<Response> {
  try {
    const { code, title } = await request.json() as { code: string; title?: string };
    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'code is required' }, { status: 400 });
    }
    if (code.length > 100_000) {
      return Response.json({ error: 'code too large (max 100KB)' }, { status: 400 });
    }

    const id = generateId();
    await env.DIAGRAMS.put(id, JSON.stringify({ code, title: title || 'Shared Diagram', createdAt: Date.now() }), {
      expirationTtl: 60 * 60 * 24 * 90, // 90 days
    });

    return Response.json({ id, url: `${new URL(request.url).origin}/?d=${id}` }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

async function handleShareGet(id: string, env: Env): Promise<Response> {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const data = await env.DIAGRAMS.get(id);
  if (!data) {
    return Response.json({ error: 'Diagram not found' }, { status: 404 });
  }

  return new Response(data, {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
