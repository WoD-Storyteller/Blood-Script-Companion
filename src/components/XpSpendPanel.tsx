import { useState } from 'react';
import { requestXpSpend } from '../api';

export default function XpSpendPanel({ characterId }: { characterId: string }) {
  const [type, setType] = useState('skill');
  const [current, setCurrent] = useState(0);
  const [reason, setReason] = useState('');

  return (
    <div style={{ border: '1px solid #ddd', padding: 12 }}>
      <h3>Spend XP</h3>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="skill">Skill</option>
        <option value="attribute">Attribute</option>
        <option value="discipline">Discipline</option>
        <option value="blood_potency">Blood Potency</option>
      </select>

      <input
        type="number"
        value={current}
        onChange={(e) => setCurrent(Number(e.target.value))}
        placeholder="Current dots"
      />

      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason"
      />

      <button
        onClick={async () => {
          const res = await requestXpSpend({
            characterId,
            type,
            current,
            reason,
          });
          alert(res.ok ? 'XP request submitted' : JSON.stringify(res));
        }}
      >
        Submit
      </button>
    </div>
  );
}