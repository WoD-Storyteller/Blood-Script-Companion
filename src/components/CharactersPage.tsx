import { useEffect, useState } from 'react';
import {
  fetchCharacters,
  fetchCharacter,
  setActiveCharacter,
  updateCharacterSheet,
} from '../api';
import V5SheetRenderer from './V5SheetRenderer';
import V5SheetEditor from './V5SheetEditor';

export default function CharactersPage() {
  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<any>(null);
  const [editSheet, setEditSheet] = useState<any>(null);

  useEffect(() => {
    fetchCharacters().then((rows) => {
      setList(rows);
      if (rows.length && !selectedId) setSelectedId(rows[0].character_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchCharacter(selectedId).then((s) => {
      setSheet(s);
      setEditSheet(null);
    });
  }, [selectedId]);

  if (!selectedId) return <p>No character selected.</p>;

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: '30%' }}>
        <h3>Characters</h3>
        {list.map((c) => (
          <div key={c.character_id}>
            <button onClick={() => setSelectedId(c.character_id)}>
              {c.name} {c.is_active ? '⭐' : ''}
            </button>
            <button
              onClick={async () => {
                await setActiveCharacter(c.character_id);
                setList((l) =>
                  l.map((x) => ({
                    ...x,
                    is_active: x.character_id === c.character_id,
                  })),
                );
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
            <button onClick={() => setEditSheet({ ...sheet })}>Edit</button>
            <V5SheetRenderer sheet={sheet} />
          </>
        )}

        {editSheet && (
          <>
            <V5SheetEditor sheet={editSheet} onChange={setEditSheet} />
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
          </>
        )}
      </div>
    </div>
  );
}