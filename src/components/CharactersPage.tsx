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

import HungerFrenzyAnimator from './HungerFrenzyAnimator';
import RemorseRollPanel from './RemorseRollPanel';
import ClanCompulsionPanel from './ClanCompulsionPanel';

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

  const refreshSheet = async (id: string) => {
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
  }, []);

  useEffect(() => {
    if (selectedId) refreshSheet(selectedId);
  }, [selectedId]);

  if (!selectedId) {
    return <div className="text-blood-bone">No character selected.</div>;
  }

  return (
    <>
      {/* 🔥 AUTOMATED HUNGER FRENZY OVERLAY */}
      {sheet && (
        <HungerFrenzyAnimator
          hunger={sheet.hunger ?? 0}
          willpower={sheet.willpower?.current ?? 0}
        />
      )}

      <div className="flex gap-6 mt-6">
        {/* LEFT — CHARACTER LIST */}
        <div className="w-1/4 bg-blood-ash rounded-xl p-4 border border-blood-red/40">
          <h3 className="text-lg text-blood-crimson mb-4">Characters</h3>

          {error && (
            <div className="mb-2 text-sm text-red-400">
              Error: {error}
            </div>
          )}

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
                  try {
                    await setActiveCharacter(c.character_id);
                    refreshList();
                  } catch (err: any) {
                    setError(err.message);
                  }
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
              {/* CORE VITALS */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <HungerMeter hunger={sheet.hunger ?? 0} />
                <BloodPoolBar
                  current={sheet.blood?.current ?? 0}
                  max={sheet.blood?.max ?? 10}
                />
                <WillpowerTracker
                  current={sheet.willpower?.current ?? 0}
                  superficial={sheet.willpower?.superficial ?? 0}
                  aggravated={sheet.willpower?.aggravated ?? 0}
                />
              </div>

              {/* CLAN COMPULSION (AUTO-TRIGGERED) */}
              {sheet.compulsion && (
                <ClanCompulsionPanel compulsion={sheet.compulsion} />
              )}

              {/* PREDATOR TYPE */}
              <PredatorTypePanel predator={sheet.predator_type} />

              {/* CHARACTER SHEET */}
              <V5SheetRenderer sheet={sheet} />

              {/* DISCIPLINES */}
              <DisciplinesPanel disciplines={sheet.disciplines ?? []} />

              {/* ADVANTAGES / FLAWS */}
              <AdvantagesPanel
                advantages={sheet.advantages ?? []}
                flaws={sheet.flaws ?? []}
              />

              {/* CONVICTIONS & TOUCHSTONES */}
              <ConvictionsPanel
                convictions={sheet.convictions ?? []}
                touchstones={sheet.touchstones ?? []}
              />

              {/* REMORSE ROLL */}
              <div className="mt-6">
                <RemorseRollPanel
                  humanity={sheet.humanity ?? 7}
                  stains={sheet.stains ?? 0}
                  onResolve={() => {}}
                />
              </div>

              {/* XP */}
              <XpSpendPanel characterId={selectedId} sheet={sheet} />

              {/* ACTIONS */}
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

          {/* EDIT MODE */}
          {editSheet && (
            <>
              <V5SheetEditor sheet={editSheet} onChange={setEditSheet} />

              <div className="mt-4 flex gap-3">
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
    </>
  );
}