const API_BASE = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }

  return res.json();
}

export async function listEngines() {
  return request('/owner/engines');
}

export async function banEngine(engineId: string, reason: string) {
  return request('/owner/ban-engine', {
    method: 'POST',
    body: JSON.stringify({ engineId, reason }),
  });
}

export async function unbanEngine(engineId: string) {
  return request('/owner/unban-engine', {
    method: 'POST',
    body: JSON.stringify({ engineId }),
  });
}

export async function inspectEngine(engineId: string) {
  return request('/owner/engine', {
    method: 'POST',
    body: JSON.stringify({ engineId }),
  });
}