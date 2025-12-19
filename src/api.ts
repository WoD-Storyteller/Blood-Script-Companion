import {
  WorldState,
  SessionInfo,
  CharacterSummary,
  CharacterSheet,
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
    headers['x-csrf-token'] = csrfToken;
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

export const fetchCharacters = async () =>
  (await call<{ characters: CharacterSummary[] }>('/companion/characters')).characters;

export const fetchCharacter = async (id: string) =>
  (await call<{ character: CharacterSheet }>(`/companion/characters/${id}`)).character;

export const requestXpSpend = (input: {
  characterId: string;
  type: string;
  current: number;
  reason: string;
}) =>
  call('/companion/xp/spend', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const fetchPendingXp = async () =>
  (await call<{ pending: any[] }>('/companion/xp/pending')).pending;

export const approveXp = (xpId: string) =>
  call('/companion/xp/approve', {
    method: 'POST',
    body: JSON.stringify({ xpId }),
  });