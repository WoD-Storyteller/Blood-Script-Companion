import { useEffect, useState } from 'react';
import { listEngines, banEngine, unbanEngine, issueStrike } from '../api/owner';

export default function OwnerDashboard() {
  const [engines, setEngines] = useState<any[]>([]);

  const load = async () => {
    const res = await listEngines();
    setEngines(res.engines || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Owner Dashboard</h2>

      <table width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Engine</th>
            <th align="left">Safety</th>
            <th align="left">Strikes</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((e) => {
            const danger = e.has_unresolved_red;
            const warning = !danger && e.has_unresolved_yellow;

            return (
              <tr
                key={e.engine_id}
                style={{
                  borderTop: '1px solid #333',
                  background: danger
                    ? '#3b0000'
                    : warning
                    ? '#332400'
                    : 'transparent',
                }}
              >
                <td>
                  {e.name}
                  {e.banned && (
                    <div style={{ color: 'red', fontSize: 12 }}>
                      🚫 {e.banned_reason || 'BANNED'}
                    </div>
                  )}
                </td>

                <td>
                  🔴 {e.red_unresolved}/{e.red_total} &nbsp;
                  🟡 {e.yellow_unresolved}/{e.yellow_total}
                </td>

                <td>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} style={{ opacity: i < e.strike_count ? 1 : 0.3 }}>
                      ⚠️
                    </span>
                  ))}
                </td>

                <td>
                  <button
                    onClick={async () => {
                      const reason = prompt('Strike reason') || 'Safety violation';
                      await issueStrike(e.engine_id, reason);
                      await load();
                    }}
                  >
                    Issue Strike
                  </button>

                  {!e.banned && (
                    <button
                      style={{ marginLeft: 8 }}
                      onClick={async () => {
                        const reason =
                          prompt('Ban reason') || 'Manual ban';
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}