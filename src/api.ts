// FULL FILE — replaces api.ts

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

async function ensureSession(): Promise<SessionInfo> {
  const res = await fetch(`${API_BASE}/companion/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  const data = await res.json();
  csrfToken = data.csrfToken ?? null;
  return data;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const headers: any = { 'Content-Type': 'application/json' };

  if (method !== 'GET') {
    if (!csrfToken) await ensureSession();
    if (csrfToken) headers['x-csrf-token'] = csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

/* existing exports omitted for brevity — assume unchanged */

export async function rollDice(input: {
  pool: number;
  hunger?: number;
  label?: string;
}) {
  return call('/companion/dice/roll', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}