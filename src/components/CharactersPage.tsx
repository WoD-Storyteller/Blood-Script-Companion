import { useEffect, useState } from 'react';
import {
  fetchCharacters,
  fetchCharacter,
  setActiveCharacter,
  updateCharacterSheet,
} from '../api';
import V5SheetRenderer from './V5SheetRenderer';
import V5SheetEditor from './V5SheetEditor';
import XpSpendPanel from './XpSpendPanel';

export default function CharactersPage() {
  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<any>(null);
  const [editSheet, setEditSheet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshList = async () => {
    try {
      const rows = await fetchCharacters();
      setList(rows);
      if (!selectedId && rows.length) setSelectedId(rows[0].character_id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchCharacter(selectedId)
      .then((s) => {
        setSheet(s);
        setEditSheet(null);
      })
      .catch((e) => setError(e.message));
  }, [selectedId]);

  if (!selectedId) return <p>No character selected.</p>;

  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
      <div style={{ width: '30%' }}>
        <h3>Characters</h3>
        {error && <div style={{ marginBottom: 10 }}>Error: {error}</div>}

        {list.map((c) => (
          <div key={c.character_id} style={{ marginBottom: 10 }}>
            <button onClick={() => setSelectedId(c.character_id)} style={{ marginRight: 8 }}>
              {c.name} {c.is_active ? '⭐' : ''}
            </button>
            <button
              onClick={async () => {
                await setActiveCharacter(c.character_id);
                await refreshList();
              }}
            >
              Set Active
            </button>
          </div>
        ))}
      </div>

      <div style={{ width: '70%' }}>
        {!editSheet && sheet && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button onClick={() => setEditSheet({ ...sheet })}>Edit</button>
            </div>

            <V5SheetRenderer sheet={sheet} />

            {/* XP Spend requests (applied after ST approval) */}
            <XpSpendPanel characterId={selectedId} sheet={sheet} />
          </>
        )}

        {editSheet && (
          <>
            <V5SheetEditor sheet={editSheet} onChange={setEditSheet} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={async () => {
                  await updateCharacterSheet(selectedId, editSheet);
                  setSheet(editSheet);
                  setEditSheet(null);
                }}
              >
                Save
              </button>
              <button onClick={() => setEditSheet(null)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}