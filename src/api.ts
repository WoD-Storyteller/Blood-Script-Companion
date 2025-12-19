import {
  WorldState,
  SessionInfo,
  CharacterSummary,
  CharacterSheet,
  CoterieSummary,
  CoterieDetail,
  AiIntent,
} from './types';

const API_BASE = 'http://localhost:3000';

let csrfToken: string | null = null;

async function ensureCsrf() {
  if (csrfToken) return csrfToken;

  const res = await fetch(`${API_BASE}/companion/me`, {
    credentials: 'include',
  });
  const data = await res.json();
  csrfToken = data?.csrfToken ?? null;
  return csrfToken;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: any = {
    ...(init?.headers ?? {}),
    'Content-Type': 'application/json',
  };

  if (init?.method && init.method !== 'GET') {
    const csrf = await ensureCsrf();
    if (csrf) headers['x-csrf-token'] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

/* All API functions unchanged below — they now auto-include CSRF */