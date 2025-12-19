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
import { getRealtime, connectRealtime } from '../realtime';

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

  const refreshSelectedSheet = async (id: string) => {
    try {
      const s = await fetchCharacter(id);
      setSheet(s);
      setEditSheet(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshList();
    // Ensure socket exists for this page’s listeners
    connectRealtime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    refreshSelectedSheet(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Realtime subscriptions
  useEffect(() => {
    const sock = getRealtime();
    if (!sock) return;

    const onCharUpdated = (payload: any) => {
      const cid = payload?.characterId;
      if (!cid) return;

      // If the currently viewed character was updated, refresh it
      if (selectedId && String(cid) === String(selectedId)) {
        refreshSelectedSheet(selectedId);
      }

      // Also refresh list (active star / name / etc.)
      refreshList();
    };

    const onActiveChanged = (payload: any) => {
      // Always refresh list so ⭐ updates immediately
      refreshList();
    };

    sock.on('character_updated', onCharUpdated);
    sock.on('active_character_changed', onActiveChanged);

    return () => {
      try {
        sock.off('character_updated', onCharUpdated);
        sock.off('active_character_changed', onActiveChanged);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                try {
                  await setActiveCharacter(c.character_id);
                  await refreshList();
                } catch (e: any) {
                  setError(e.message);
                }
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
              <button
                onClick={async () => {
                  if (selectedId) await refreshSelectedSheet(selectedId);
                }}
              >
                Refresh
              </button>
            </div>

            <V5SheetRenderer sheet={sheet} />
            <XpSpendPanel characterId={selectedId} sheet={sheet} />
          </>
        )}

        {editSheet && (
          <>
            <V5SheetEditor sheet={editSheet} onChange={setEditSheet} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={async () => {
                  try {
                    await updateCharacterSheet(selectedId, editSheet);
                    setSheet(editSheet);
                    setEditSheet(null);
                  } catch (e: any) {
                    setError(e.message);
                  }
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