import { WorldState } from './types';

const API_BASE = 'http://localhost:3000';

export async function fetchWorld(token: string): Promise<WorldState> {
  const res = await fetch(`${API_BASE}/companion/world`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch world state');
  }

  return res.json();
}