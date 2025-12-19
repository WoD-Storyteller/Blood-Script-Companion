import { WorldState, CharacterSummary, CharacterSheet, CoterieSummary, CoterieDetail } from './types';

const API_BASE = 'http://localhost:3000';

async function authed<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export async function fetchWorld(token: string): Promise<WorldState> {
  return authed<WorldState>('/companion/world', token);
}

export async function fetchCharacters(token: string): Promise<CharacterSummary[]> {
  const res = await authed<{ characters: CharacterSummary[] }>('/companion/characters', token);
  return res.characters ?? [];
}

export async function fetchCharacter(token: string, id: string): Promise<CharacterSheet | null> {
  const res = await authed<{ character?: CharacterSheet; error?: string }>(`/companion/characters/${id}`, token);
  return res.character ?? null;
}

export async function fetchCoteries(token: string): Promise<CoterieSummary[]> {
  const res = await authed<{ coteries: CoterieSummary[] }>('/companion/coteries', token);
  return res.coteries ?? [];
}

export async function fetchCoterie(token: string, id: string): Promise<CoterieDetail | null> {
  const res = await authed<{ coterie?: CoterieDetail; error?: string }>(`/companion/coteries/${id}`, token);
  return res.coterie ?? null;
}