// FULL FILE — replaces existing api.ts

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

export const fetchMe = () => ensureSession();
export const fetchWorld = () => call<WorldState>('/companion/world');

export const fetchCharacters = async () =>
  (await call<{ characters: CharacterSummary[] }>('/companion/characters')).characters;

export const fetchCharacter = async (id: string) =>
  (await call<{ character: CharacterSheet }>(`/companion/characters/${id}`)).character;

export const setActiveCharacter = async (id: string) =>
  call(`/companion/characters/${id}/active`, { method: 'POST' });

export const updateCharacterSheet = async (id: string, sheet: any) =>
  call(`/companion/characters/${id}/update`, {
    method: 'POST',
    body: JSON.stringify(sheet),
  });