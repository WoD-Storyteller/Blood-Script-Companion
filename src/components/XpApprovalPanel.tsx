import { useEffect, useState } from 'react';
import { fetchPendingXp, approveXp } from '../api';

export default function XpApprovalPanel() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingXp().then(setPending);
  }, []);

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Pending XP Approvals</h3>

      {pending.length === 0 ? (
        <p>No pending XP.</p>
      ) : (
        pending.map((p) => (
          <div key={p.xp_id} style={{ border: '1px solid #ddd', padding: 8 }}>
            <div>Character: {p.character_id}</div>
            <div>Amount: {p.amount}</div>
            <div>Reason: {p.reason}</div>
            <button
              onClick={async () => {
                await approveXp(p.xp_id);
                setPending((x) => x.filter((y) => y.xp_id !== p.xp_id));
              }}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}