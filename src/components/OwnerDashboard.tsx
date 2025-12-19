import { useEffect, useState } from 'react';
import {
  listEngines,
  banEngine,
  unbanEngine,
  inspectEngine,
} from '../api/owner';

type Engine = {
  engine_id: string;
  name: string;
  banned: boolean;
  banned_reason?: string;

  red_total: number;
  red_resolved: number;
  red_unresolved: number;

  yellow_total: number;
  yellow_resolved: number;
  yellow_unresolved: number;

  green_total: number;
};

export default function OwnerDashboard() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await listEngines();
      setEngines(res.engines || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load engines');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Owner Dashboard</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 16,
        }}
      >
        <thead>
          <tr>
            <th align="left">Engine</th>
            <th align="left">Status</th>
            <th align="left">Safety</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((e) => (
            <tr key={e.engine_id} style={{ borderTop: '1px solid #333' }}>
              <td>{e.name}</td>
              <td>
                {e.banned ? (
                  <span style={{ color: 'red' }}>
                    BANNED {e.banned_reason ? `— ${e.banned_reason}` : ''}
                  </span>
                ) : (
                  <span style={{ color: 'green' }}>Active</span>
                )}
              </td>
              <td style={{ fontSize: 14 }}>
                <div>🔴 Red: {e.red_total} (✔ {e.red_resolved} / ⏳ {e.red_unresolved})</div>
                <div>🟡 Yellow: {e.yellow_total} (✔ {e.yellow_resolved} / ⏳ {e.yellow_unresolved})</div>
                <div>🟢 Green: {e.green_total}</div>
              </td>
              <td>
                <button
                  onClick={async () => {
                    const info = await inspectEngine(e.engine_id);
                    setSelected(info.engine);
                  }}
                >
                  Inspect
                </button>

                {!e.banned && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      const reason =
                        prompt('Ban reason (optional)') || 'Policy violation';
                      await banEngine(e.engine_id, reason);
                      await load();
                    }}
                  >
                    Ban
                  </button>
                )}

                {e.banned && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      await unbanEngine(e.engine_id);
                      await load();
                    }}
                  >
                    Unban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div style={{ marginTop: 24 }}>
          <h3>Engine Details</h3>
          <pre
            style={{
              background: '#111',
              padding: 12,
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(selected, null, 2)}
          </pre>
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}