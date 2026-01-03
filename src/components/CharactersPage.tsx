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

/* =========================
   Hunger Meter (V5 style)
   ========================= */
function HungerMeter({ hunger }: { hunger: number }) {
  const max = 5;

  return (
    <div>
      <div className="text-sm uppercase tracking-wide text-blood-crimson mb-1">
        Hunger
      </div>

      <div className="flex gap-2">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < hunger;

          return (
            <div
              key={i}
              className={`
                w-4 h-4 rounded-full border
                ${filled
                  ? 'bg-blood-red border-blood-crimson shadow-[0_0_6px_rgba(180,0,0,0.7)]'
                  : 'bg-blood-dark border-blood-red/40'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Blood Pool Bar
   ========================= */
function BloodPoolBar({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs uppercase text-blood-bone mb-1">
        <span>Blood</span>
        <span>
          {current} / {max}
        </span>
      </div>

      <div className="h-2 rounded bg-blood-dark overflow-hidden border border-blood-red/40">
        <div
          className="h-full bg-gradient-to-r from-blood-red to-blood-crimson transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* =========================
   Characters Page
   ========================= */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    refreshSelectedSheet(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Realtime updates
  useEffect(() => {
    const sock = getRealtime();
    if (!sock) return;

    const onCharUpdated = (payload: any) => {
      const cid = payload?.characterId;
      if (!cid) return;

      if (selectedId && String(cid) === String(selectedId)) {
        refreshSelectedSheet(selectedId);
      }

      refreshList();
    };

    const onActiveChanged = () => {
      refreshList();
    };

    sock.on('character_updated', onCharUpdated);
    sock.on('active_character_changed', onActiveChanged);

    return () => {
      sock.off('character_updated', onCharUpdated);
      sock.off('active_character_changed', onActiveChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!selectedId) {
    return <p className="text-blood-bone">No character selected.</p>;
  }

  return (
    <div className="flex gap-6 mt-4">
      {/* LEFT COLUMN — CHARACTER LIST */}
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
                }`}
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

      {/* RIGHT COLUMN — SHEET */}
      <div className="w-2/3 bg-blood-ash rounded-xl p-4 border border-blood-red/40">
        {!editSheet && sheet && (
          <>
            {/* Hunger / Blood */}
            <div className="mb-6 p-3 rounded-xl bg-blood-dark border border-blood-red/40">
              <HungerMeter hunger={sheet.hunger ?? 0} />

              {sheet.blood && (
                <BloodPoolBar
                  current={sheet.blood.current}
                  max={sheet.blood.max}
                />
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEditSheet({ ...sheet })}
                className="px-3 py-1 rounded bg-blood-crimson hover:bg-blood-red"
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  if (selectedId) await refreshSelectedSheet(selectedId);
                }}
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