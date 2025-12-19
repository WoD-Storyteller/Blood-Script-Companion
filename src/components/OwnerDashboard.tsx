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
  banned_at?: string;
};

export default function OwnerDashboard() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await listEngines();
      setEngines(res.engines || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load engines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Owner Dashboard</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading…</div>}

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
                    BANNED
                    {e.banned_reason ? ` — ${e.banned_reason}` : ''}
                  </span>
                ) : (
                  <span style={{ color: 'green' }}>Active</span>
                )}
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