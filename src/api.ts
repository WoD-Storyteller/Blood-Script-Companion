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

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers ?? {}),
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export async function fetchMe(): Promise<SessionInfo> {
  return call<SessionInfo>('/companion/me');
}

export async function fetchWorld(): Promise<WorldState> {
  return call<WorldState>('/companion/world');
}

export async function fetchCharacters(): Promise<CharacterSummary[]> {
  const res = await call<{ characters: CharacterSummary[] }>('/companion/characters');
  return res.characters ?? [];
}

export async function fetchCharacter(id: string): Promise<CharacterSheet | null> {
  const res = await call<{ character?: CharacterSheet }>(`/companion/characters/${id}`);
  return res.character ?? null;
}

export async function fetchCoteries(): Promise<CoterieSummary[]> {
  const res = await call<{ coteries: CoterieSummary[] }>('/companion/coteries');
  return res.coteries ?? [];
}

export async function fetchCoterie(id: string): Promise<CoterieDetail | null> {
  const res = await call<{ coterie?: CoterieDetail }>(`/companion/coteries/${id}`);
  return res.coterie ?? null;
}

// ─────────────────────────────
// ST/Admin
// ─────────────────────────────

export async function stSetMap(url: string): Promise<WorldState> {
  return call<WorldState>('/companion/st/map', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function stCreateClock(input: {
  title: string;
  segments: number;
  nightly?: boolean;
  description?: string;
}): Promise<WorldState> {
  return call<WorldState>('/companion/st/clock/create', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stTickClock(input: {
  clockIdPrefix: string;
  amount: number;
  reason: string;
}): Promise<WorldState> {
  return call<WorldState>('/companion/st/clock/tick', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stCreateArc(input: { title: string; synopsis?: string }): Promise<WorldState> {
  return call<WorldState>('/companion/st/arc/create', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stSetArcStatus(input: {
  arcIdPrefix: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  outcome?: string;
}): Promise<WorldState> {
  return call<WorldState>('/companion/st/arc/status', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function stListIntents(): Promise<AiIntent[]> {
  const res = await call<{ intents: AiIntent[] }>('/companion/st/intents');
  return res.intents ?? [];
}

export async function stApproveIntent(id: string): Promise<boolean> {
  const res = await call<{ ok: boolean }>(`/companion/st/intents/${id}/approve`, { method: 'POST' });
  return !!res.ok;
}

export async function stRejectIntent(id: string): Promise<boolean> {
  const res = await call<{ ok: boolean }>(`/companion/st/intents/${id}/reject`, { method: 'POST' });
  return !!res.ok;
}

// ─────────────────────────────
// Safety (Stoplight)
// ─────────────────────────────

export async function submitSafety(level: 'red' | 'yellow' | 'green') {
  return call('/companion/safety/submit', {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}

export async function fetchActiveSafety() {
  const res = await call<{ events: any[] }>('/companion/safety/active');
  return res.events ?? [];
}

export async function resolveSafety(id: string) {
  return call(`/companion/safety/resolve/${id}`, { method: 'POST' });
}