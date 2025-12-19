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

export async function fetchCharacters