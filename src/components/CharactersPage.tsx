import { useEffect, useState } from 'react';
import { fetchCharacter, fetchCharacters } from '../api';
import type { CharacterSummary, CharacterSheet } from '../types';
import V5SheetRenderer from './V5SheetRenderer';

export default function CharactersPage() {
  const [list, setList] = useState<CharacterSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSheet, setLoadingSheet] = useState(false);

  useEffect(() => {
    fetchCharacters()
      .then((rows) => {
        setList(rows);
        if (!selectedId && rows.length > 0) {
          setSelectedId(rows[0].character_id);
        }
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSheet(null);
      return;
    }

    setLoadingSheet(true);
    fetchCharacter(selectedId)
      .then((s) => setSheet(s))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSheet(false));
  }, [selectedId]);

  return (
    <div style={{ marginTop: 12 }}>
      <h2>Characters</h2>
      {error && <div style={{ marginBottom: 12 }}>Error: {error}</div>}

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: '34%', border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Your Characters</div>

          {list.length === 0 ? (
            <p>No characters yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {list.map((c) => {
                const active = c.character_id === selectedId;
                return (
                  <li key={c.character_id} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => setSelectedId(c.character_id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 10px',
                        borderRadius: 8,
                        border: active ? '2px solid #333' : '1px solid #ddd',
                        background: active ? '#f5f5f5' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {c.clan ? c.clan : 'Unknown clan'}
                        {c.concept ? ` • ${c.concept}` : ''}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ width: '66%' }}>
          {!selectedId && <p>Select a character to view details.</p>}
          {selectedId && loadingSheet && <p>Loading sheet…</p>}
          {selectedId && !loadingSheet && !sheet && <p>No sheet found.</p>}
          {sheet && <V5SheetRenderer sheet={sheet as any} />}
        </div>
      </div>
    </div>
  );
}