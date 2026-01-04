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
import HungerMeter from './HungerMeter';
import BloodPoolBar from './BloodPoolBar';
import WillpowerTracker from './WillpowerTracker';
import AdvantagesPanel from './AdvantagesPanel';
import DisciplinesPanel from './DisciplinesPanel';
import ConvictionsPanel from './ConvictionsPanel';
import PredatorTypePanel from './PredatorTypePanel';

export default function CharactersPage() {
  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<any>(null);
  const [editSheet, setEditSheet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshList = async () => {
    const rows = await fetchCharacters();
    setList(rows);
    if (!selectedId && rows.length) {
      setSelectedId(rows[0].character_id);
    }
  };

  const refreshSheet = async (id: string) => {
    const s = await fetchCharacter(id);
    setSheet(s);
    setEditSheet(null);
  };

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    if (selectedId) refreshSheet(selectedId);
  }, [selectedId]);

  if (!selectedId) {
    return <div className="text-blood-bone">No character selected.</div>;
  }

  return (
    <div className="flex gap-6 mt-6">
      {/* LEFT — CHARACTER LIST */}
      <div className="w-1/4 bg-blood-ash rounded-xl p-4 border border-blood-red/40">
        <h3 className="text-lg text-blood-crimson mb-4">Characters</h3>

        {list.map((c) => (
          <div
            key={c.character_id}
            className={`mb-2 p-2 rounded cursor-pointer ${
              selectedId === c.character_id
                ? 'bg-blood-dark border border-blood-crimson'
                : 'hover:bg-blood-dark/60'
            }`}
            onClick={() => setSelectedId(c.character_id)}
          >
            <div className="font-medium">
              {c.name} {c.is_active ? '⭐' : ''}
            </div>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                await setActiveCharacter(c.character_id);
                refreshList();
              }}
              className="mt-1 text-xs px-2 py-1 rounded bg-blood-crimson hover:bg-blood-red"
            >
              Set Active
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT — CHARACTER SHEET */}
      <div className="w-3/4 bg-blood-ash rounded-xl p-6 border border-blood-red/40 text-blood-bone">
        {sheet && !editSheet && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <HungerMeter hunger={sheet.hunger ?? 0} />
              <BloodPoolBar current={sheet.blood?.current ?? 0} max={sheet.blood?.max ?? 10} />
              <WillpowerTracker
                current={sheet.willpower?.current ?? 0}
                superficial={sheet.willpower?.superficial ?? 0}
                aggravated={sheet.willpower?.aggravated ?? 0}
              />
            </div>

            <PredatorTypePanel predator={sheet.predator_type} />

            <V5SheetRenderer sheet={sheet} />

            <DisciplinesPanel disciplines={sheet.disciplines ?? []} />

            <AdvantagesPanel
              advantages={sheet.advantages ?? []}
              flaws={sheet.flaws ?? []}
            />

            <ConvictionsPanel
              convictions={sheet.convictions ?? []}
              touchstones={sheet.touchstones ?? []}
            />

            <XpSpendPanel characterId={selectedId} sheet={sheet} />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditSheet(structuredClone(sheet))}
                className="px-4 py-2 rounded bg-blood-crimson hover:bg-blood-red"
              >
                Edit Sheet
              </button>

              <button
                onClick={() => refreshSheet(selectedId)}
                className="px-4 py-2 rounded bg-blood-dark border border-blood-red/40"
              >
                Refresh
              </button>
            </div>
          </>
        )}

        {editSheet && (
          <>
            <V5SheetEditor sheet={editSheet} onChange={setEditSheet} />

            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  await updateCharacterSheet(selectedId, editSheet);
                  setSheet(editSheet);
                  setEditSheet(null);
                }}
                className="px-4 py-2 rounded bg-blood-crimson hover:bg-blood-red"
              >
                Save
              </button>

              <button
                onClick={() => setEditSheet(null)}
                className="px-4 py-2 rounded bg-blood-dark border border-blood-red/40"
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