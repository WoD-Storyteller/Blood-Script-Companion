import { useEffect, useState } from 'react';
import type { AiIntent, WorldState } from '../types';
import {
  stSetMap,
  stCreateClock,
  stTickClock,
  stCreateArc,
  stSetArcStatus,
  stListIntents,
  stApproveIntent,
  stRejectIntent,
} from '../api';

export default function AdminPage({
  token,
  onWorldUpdate,
}: {
  token: string;
  onWorldUpdate: (w: WorldState) => void;
}) {
  const [mapUrl, setMapUrl] = useState('');
  const [clockTitle, setClockTitle] = useState('');
  const [clockSegments, setClockSegments] = useState(6);
  const [clockNightly, setClockNightly] = useState(false);
  const [clockDesc, setClockDesc] = useState('');

  const [tickIdPrefix, setTickIdPrefix] = useState('');
  const [tickAmount, setTickAmount] = useState(1);
  const [tickReason, setTickReason] = useState('ST tick.');

  const [arcTitle, setArcTitle] = useState('');
  const [arcSynopsis, setArcSynopsis] = useState('');

  const [arcIdPrefix, setArcIdPrefix] = useState('');
  const [arcStatus, setArcStatus] = useState<'planned' | 'active' | 'completed' | 'cancelled'>('active');
  const [arcOutcome, setArcOutcome] = useState('');

  const [intents, setIntents] = useState<AiIntent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshIntents = async () => {
    try {
      const rows = await stListIntents(token);
      setIntents(rows);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshIntents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ marginTop: 12 }}>
      <h2>Admin / Storyteller</h2>
      {error && <div style={{ marginBottom: 12 }}>Error: {error}</div>}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <section style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Map</h3>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Set the Google My Maps embed URL for this engine.
          </div>
          <input
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            placeholder="https://www.google.com/maps/d/u/0/embed?mid=..."
            style={{ width: '100%' }}
          />
          <button
            onClick={async () => {
              try {
                const w = await stSetMap(token, mapUrl);
                onWorldUpdate(w);
              } catch (e: any) {
                setError(e.message);
              }
            }}
            style={{ marginTop: 8 }}
          >
            Save Map URL
          </button>
        </section>

        <section style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Create Clock</h3>
          <input
            value={clockTitle}
            onChange={(e) => setClockTitle(e.target.value)}
            placeholder="Clock title"
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            type="number"
            value={clockSegments}
            onChange={(e) => setClockSegments(Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={clockNightly}
              onChange={(e) => setClockNightly(e.target.checked)}
            />{' '}
            Nightly
          </label>
          <input
            value={clockDesc}
            onChange={(e) => setClockDesc(e.target.value)}
            placeholder="Description (optional)"
            style={{ width: '100%' }}
          />
          <button
            onClick={async () => {
              try {
                const w = await stCreateClock(token, {
                  title: clockTitle,
                  segments: clockSegments,
                  nightly: clockNightly,
                  description: clockDesc || undefined,
                });
                onWorldUpdate(w);
                setClockTitle('');
                setClockDesc('');
              } catch (e: any) {
                setError(e.message);
              }
            }}
            style={{ marginTop: 8 }}
          >
            Create Clock
          </button>
        </section>

        <section style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Tick Clock</h3>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Use a clock id prefix (e.g. first 8 chars) or full id.
          </div>
          <input
            value={tickIdPrefix}
            onChange={(e) => setTickIdPrefix(e.target.value)}
            placeholder="clockIdPrefix"
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            type="number"
            value={tickAmount}
            onChange={(e) => setTickAmount(Number(e.target.value))}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            value={tickReason}
            onChange={(e) => setTickReason(e.target.value)}
            placeholder='Reason (e.g. "Witness testimony spreads.")'
            style={{ width: '100%' }}
          />
          <button
            onClick={async () => {
              try {
                const w = await stTickClock(token, {
                  clockIdPrefix: tickIdPrefix,
                  amount: tickAmount,
                  reason: tickReason,
                });
                onWorldUpdate(w);
              } catch (e: any) {
                setError(e.message);
              }
            }}
            style={{ marginTop: 8 }}
          >
            Tick Clock
          </button>
        </section>

        <section style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Create Arc</h3>
          <input
            value={arcTitle}
            onChange={(e) => setArcTitle(e.target.value)}
            placeholder="Arc title"
            style={{ width: '100%', marginBottom: 8 }}
          />
          <input
            value={arcSynopsis}
            onChange={(e) => setArcSynopsis(e.target.value)}
            placeholder="Synopsis (optional)"
            style={{ width: '100%' }}
          />
          <button
            onClick={async () => {
              try {
                const w = await stCreateArc(token, { title: arcTitle, synopsis: arcSynopsis || undefined });
                onWorldUpdate(w);
                setArcTitle('');
                setArcSynopsis('');
              } catch (e: any) {
                setError(e.message);
              }
            }}
            style={{ marginTop: 8 }}
          >
            Create Arc
          </button>
        </section>
      </div>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #ddd' }}>
        <h3>Update Arc Status</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={arcIdPrefix}
            onChange={(e) => setArcIdPrefix(e.target.value)}
            placeholder="arcIdPrefix"
            style={{ width: 180 }}
          />
          <select value={arcStatus} onChange={(e) => setArcStatus(e.target.value as any)}>
            <option value="planned">planned</option>
            <option value="active">active</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input
            value={arcOutcome}
            onChange={(e) => setArcOutcome(e.target.value)}
            placeholder="Outcome (optional)"
            style={{ minWidth: 280, flex: 1 }}
          />
          <button
            onClick={async () => {
              try {
                const w = await stSetArcStatus(token, {
                  arcIdPrefix,
                  status: arcStatus,
                  outcome: arcOutcome || undefined,
                });
                onWorldUpdate(w);
              } catch (e: any) {
                setError(e.message);
              }
            }}
          >
            Apply
          </button>
        </div>
      </section>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #ddd' }}>
        <h3>AI Intents</h3>
        <button onClick={refreshIntents}>Refresh</button>

        {intents.length === 0 ? (
          <p style={{ marginTop: 8 }}>No intents found (or ai_intents table not present yet).</p>
        ) : (
          <ul style={{ marginTop: 8 }}>
            {intents.map((i) => (
              <li key={i.intent_id} style={{ marginBottom: 12 }}>
                <div>
                  <strong>{i.intent_type}</strong> — {i.status}{' '}
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    ({String(i.intent_id).slice(0, 8)})
                  </span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Actor: {i.actor_type} {String(i.actor_id).slice(0, 8)}
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 8 }}>
                  {JSON.stringify(i.payload, null, 2)}
                </pre>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={i.status !== 'proposed'}
                    onClick={async () => {
                      try {
                        await stApproveIntent(token, i.intent_id);
                        await refreshIntents();
                      } catch (e: any) {
                        setError(e.message);
                      }
                    }}
                  >
                    Approve
                  </button>
                  <button
                    disabled={i.status !== 'proposed'}
                    onClick={async () => {
                      try {
                        await stRejectIntent(token, i.intent_id);
                        await refreshIntents();
                      } catch (e: any) {
                        setError(e.message);
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}