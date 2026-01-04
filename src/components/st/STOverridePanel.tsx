import { useState } from 'react';
import { getRealtime } from '../../realtime';

type Props = {
  engineId: string;
  characterId?: string;
};

export default function STOverridePanel({ engineId, characterId }: Props) {
  const [open, setOpen] = useState(false);
  const socket = getRealtime();

  if (!socket) return null;

  const emit = (event: string, payload: any = {}) => {
    socket.emit('st_override', {
      engineId,
      characterId,
      event,
      payload,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded bg-black border border-blood-red/60 text-blood-crimson hover:bg-blood-dark"
      >
        ST Controls
      </button>

      {open && (
        <div className="mt-2 w-64 bg-blood-ash border border-blood-red/50 rounded-xl p-3 space-y-2 shadow-xl">
          <div className="text-sm uppercase tracking-wide text-blood-bone mb-1">
            Overrides
          </div>

          <button
            onClick={() => emit('frenzy')}
            className="w-full px-3 py-2 rounded bg-red-800 hover:bg-red-700"
          >
            Trigger Frenzy
          </button>

          <button
            onClick={() => emit('messy_critical')}
            className="w-full px-3 py-2 rounded bg-blood-crimson hover:bg-blood-red"
          >
            Messy Critical
          </button>

          <button
            onClick={() => emit('bestial_failure')}
            className="w-full px-3 py-2 rounded bg-black border border-red-500 hover:bg-red-900"
          >
            Bestial Failure
          </button>

          <button
            onClick={() => emit('blood_surge')}
            className="w-full px-3 py-2 rounded bg-blood-dark border border-blood-red/40 hover:bg-blood-dark/80"
          >
            Blood Surge
          </button>

          <button
            onClick={() =>
              emit('humanity_degeneration', { stains: 1 })
            }
            className="w-full px-3 py-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            Humanity Degeneration
          </button>

          <div className="text-xs text-blood-bone/70 pt-1">
            ST-only. UI test safe.
          </div>
        </div>
      )}
    </div>
  );
}
