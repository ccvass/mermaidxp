const API_BASE = '';

export async function createShareLink(code: string, title?: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, title }),
  });
  if (!response.ok) throw new Error('Failed to create share link');
  const { url } = await response.json();
  return url;
}

export async function loadSharedDiagram(id: string): Promise<{ code: string; title: string } | null> {
  const response = await fetch(`${API_BASE}/api/share/${id}`);
  if (!response.ok) return null;
  return response.json();
}
