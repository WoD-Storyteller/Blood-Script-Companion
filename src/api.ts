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

async function authed<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export async function fetchMe(token: string): Promise<SessionInfo> {
  return authed<SessionInfo>('/companion/me', token);
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

// ─────────────────────────────────────────────
// STEP 10: ST/Admin endpoints
// ─────────────────────────────────────────────

export async function stSetMap(token: string, url: string): Promise<WorldState> {
  return authed<WorldState>('/companion/st/map', token, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function stCreateClock(token: string, input: {
  title: string;
  segments: number;
  nightly?: boolean;
  description?: string;
}): Promise<WorldState> {
  return authed<WorldState>('/companion/st/clock/create', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stTickClock(token: string, input: {
  clockIdPrefix: string;
  amount: number;
  reason: string;
}): Promise<WorldState> {
  return authed<WorldState>('/companion/st/clock/tick', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stCreateArc(token: string, input: { title: string; synopsis?: string }): Promise<WorldState> {
  return authed<WorldState>('/companion/st/arc/create', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stSetArcStatus(token: string, input: {
  arcIdPrefix: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  outcome?: string;
}): Promise<WorldState> {
  return authed<WorldState>('/companion/st/arc/status', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stListIntents(token: string): Promise<AiIntent[]> {
  const res = await authed<{ intents: AiIntent[] }>('/companion/st/intents', token);
  return res.intents ?? [];
}

export async function stApproveIntent(token: string, id: string): Promise<boolean> {
  const res = await authed<{ ok: boolean }>(`/companion/st/intents/${id}/approve`, token, { method: 'POST' });
  return !!res.ok;
}

export async function stRejectIntent(token: string, id: string): Promise<boolean> {
  const res = await authed<{ ok: boolean }>(`/companion/st/intents/${id}/reject`, token, { method: 'POST' });
  return !!res.ok;
}