const API_BASE = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const listEngines = () => request('/owner/engines');
export const listAppeals = () => request('/engine/appeals');

export const banEngine = (engineId: string, reason: string) =>
  request('/owner/ban-engine', {
    method: 'POST',
    body: JSON.stringify({ engineId, reason }),
  });

export const unbanEngine = (engineId: string) =>
  request('/owner/unban-engine', {
    method: 'POST',
    body: JSON.stringify({ engineId }),
  });

export const issueStrike = (engineId: string, reason: string) =>
  request('/owner/issue-strike', {
    method: 'POST',
    body: JSON.stringify({ engineId, reason }),
  });

export const resolveAppeal = (
  appealId: string,
  resolutionReason: string,
  ownerNotes: string,
  unban: boolean,
) =>
  request('/engine/appeals/resolve', {
    method: 'POST',
    body: JSON.stringify({
      appealId,
      resolutionReason,
      ownerNotes,
      unban,
    }),
  });