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
      if (!selectedId && rows.length) {
        setSelectedId(rows[0].character_id);
      }
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
    connectRealtime();
  }, []);

  useEffect(() => {
    if (selectedId) {
      refreshSelectedSheet(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    const sock = getRealtime();
    if (!sock) return;

    const onCharUpdated = () => {
      refreshList();
      if (selectedId) refreshSelectedSheet(selectedId);
    };

    sock.on('character_updated', onCharUpdated);
    sock.on('active_character_changed', onCharUpdated);

    return () => {
      sock.off('character_updated', onCharUpdated);
      sock.off('active_character_changed', onCharUpdated);
    };
  }, [selectedId]);

  if (!selectedId) {
    return <p className="text-blood-bone">No character selected.</p>;
  }

  return (
    <div className="flex gap-6 mt-4">
      {/* LEFT — CHARACTER LIST */}
      <div className="w-1/3 bg-blood-ash rounded-xl p-4 border border-blood-red/40">
        <h3 className="text-lg font-semibold mb-4 text-blood-crimson">
          Characters
        </h3>

        {error && (
          <div className="mb-3 text-sm text-red-400">
            Error: {error}
          </div>
        )}

        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.character_id}
              className={`flex items-center justify-between p-2 rounded
                ${
                  selectedId === c.character_id
                    ? 'bg-blood-dark border border-blood-crimson'
                    : 'hover:bg-blood-dark/60'
                }
              `}
            >
              <button
                onClick={() => setSelectedId(c.character_id)}
                className="text-left flex-1"
              >
                <div className="font-medium">
                  {c.name} {c.is_active ? '⭐' : ''}
                </div>
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
                className="ml-2 px-2 py-1 text-xs rounded
                           bg-blood-crimson hover:bg-blood-red transition"
              >
                Active
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — CHARACTER SHEET */}
      <div className="w-2/3 bg-blood-ash rounded-xl p-4 border border-blood-red/40">
        {!editSheet && sheet && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEditSheet({ ...sheet })}
                className="px-3 py-1 rounded bg-blood-crimson hover:bg-blood-red"
              >
                Edit
              </button>

              <button
                onClick={() => refreshSelectedSheet(selectedId)}
                className="px-3 py-1 rounded bg-blood-dark border border-blood-red/50"
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

            <div className="flex gap-2 mt-4">
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
                className="px-3 py-1 rounded bg-blood-crimson hover:bg-blood-red"
              >
                Save
              </button>

              <button
                onClick={() => setEditSheet(null)}
                className="px-3 py-1 rounded bg-blood-dark border border-blood-red/50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}