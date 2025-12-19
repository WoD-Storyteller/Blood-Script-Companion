import { useEffect, useState } from 'react';
import { fetchCharacter, fetchCharacters } from '../api';
import type { CharacterSummary, CharacterSheet } from '../types';

export default function CharactersPage({ token }: { token: string }) {
  const [list, setList] = useState<CharacterSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters(token)
      .then(setList)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (!selectedId) {
      setSheet(null);
      return;
    }
    fetchCharacter(token, selectedId)
      .then(setSheet)
      .catch((e) => setError(e.message));
  }, [token, selectedId]);

  return (
    <div style={{ marginTop: 12 }}>
      <h2>Characters</h2>

      {error && <div style={{ marginBottom: 12 }}>Error: {error}</div>}

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: '40%' }}>
          {list.length === 0 ? (
            <p>No characters yet.</p>
          ) : (
            <ul>
              {list.map((c) => (
                <li key={c.character_id} style={{ marginBottom: 8 }}>
                  <button onClick={() => setSelectedId(c.character_id)}>
                    {c.name}
                  </button>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {c.clan ? c.clan : 'Unknown clan'}
                    {c.concept ? ` — ${c.concept}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ width: '60%' }}>
          <h3>Sheet</h3>
          {!selectedId && <p>Select a character to view details.</p>}
          {selectedId && !sheet && <p>Loading…</p>}
          {sheet && (
            <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 12 }}>
              {JSON.stringify(sheet, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
