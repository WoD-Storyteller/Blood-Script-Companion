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

/**
 * Cached CSRF token for this browser session.
 * Issued by backend as part of /companion/me response.
 */
let csrfToken: string | null = null;

/**
 * Fetches session info and CSRF token.
 * Called automatically when needed.
 */
async function ensureSession(): Promise<SessionInfo> {
  const res = await fetch(`${API_BASE}/companion/me`, {
    credentials: 'include',
  });

  if (!res.ok) {
    csrfToken = null;
    throw new Error('Not authenticated');
  }

  const data = await res.json();

  csrfToken = data.csrfToken ?? null;
  return data as SessionInfo;
}

/**
 * Core HTTP helper.
 * - Always sends cookies
 * - Automatically injects CSRF token for mutating requests
 */
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method?.toUpperCase() ?? 'GET';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (method !== 'GET') {
    if (!csrfToken) {
      await ensureSession();
    }
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${method} ${path}`);
  }

  return res.json();
}

/* ─────────────────────────────────────────────
   SESSION / WORLD
───────────────────────────────────────────── */

export async function fetchMe(): Promise<SessionInfo> {
  return ensureSession();
}

export async function fetchWorld(): Promise<WorldState> {
  return call<WorldState>('/companion/world');
}

/* ─────────────────────────────────────────────
   CHARACTERS
───────────────────────────────────────────── */

export async function fetchCharacters(): Promise<CharacterSummary[]> {
  const res = await call<{ characters: CharacterSummary[] }>(
    '/companion/characters',
  );
  return res.characters ?? [];
}

export async function fetchCharacter(
  id: string,
): Promise<CharacterSheet | null> {
  const res = await call<{ character?: CharacterSheet }>(
    `/companion/characters/${id}`,
  );
  return res.character ?? null;
}

/* ─────────────────────────────────────────────
   COTERIES
───────────────────────────────────────────── */

export async function fetchCoteries(): Promise<CoterieSummary[]> {
  const res = await call<{ coteries: CoterieSummary[] }>(
    '/companion/coteries',
  );
  return res.coteries ?? [];
}

export async function fetchCoterie(
  id: string,
): Promise<CoterieDetail | null> {
  const res = await call<{ coterie?: CoterieDetail }>(
    `/companion/coteries/${id}`,
  );
  return res.coterie ?? null;
}

/* ─────────────────────────────────────────────
   ST / ADMIN CONTROLS
───────────────────────────────────────────── */

export async function stSetMap(
  url: string,
): Promise<WorldState> {
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

export async function stCreateArc(input: {
  title: string;
  synopsis?: string;
}): Promise<WorldState> {
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

/* ─────────────────────────────────────────────
   AI INTENTS
───────────────────────────────────────────── */

export async function stListIntents(): Promise<AiIntent[]> {
  const res = await call<{ intents: AiIntent[] }>(
    '/companion/st/intents',
  );
  return res.intents ?? [];
}

export async function stApproveIntent(
  id: string,
): Promise<boolean> {
  const res = await call<{ ok: boolean }>(
    `/companion/st/intents/${id}/approve`,
    { method: 'POST' },
  );
  return !!res.ok;
}

export async function stRejectIntent(
  id: string,
): Promise<boolean> {
  const res = await call<{ ok: boolean }>(
    `/companion/st/intents/${id}/reject`,
    { method: 'POST' },
  );
  return !!res.ok;
}

/* ─────────────────────────────────────────────
   SAFETY — STOPLIGHT (X / N / O)
───────────────────────────────────────────── */

export async function submitSafety(
  level: 'red' | 'yellow' | 'green',
): Promise<void> {
  await call('/companion/safety/submit', {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}

export async function fetchActiveSafety(): Promise<any[]> {
  const res = await call<{ events: any[] }>(
    '/companion/safety/active',
  );
  return res.events ?? [];
}

export async function resolveSafety(
  eventId: string,
): Promise<void> {
  await call(`/companion/safety/resolve/${eventId}`, {
    method: 'POST',
  });
}