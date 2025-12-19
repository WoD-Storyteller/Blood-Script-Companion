import React from 'react';

export default function V5SheetEditor({
  sheet,
  onChange,
}: {
  sheet: any;
  onChange: (s: any) => void;
}) {
  const set = (k: string, v: any) => onChange({ ...sheet, [k]: v });

  return (
    <div>
      <h3>Edit Character</h3>

      <label>Name</label>
      <input
        value={sheet.name ?? ''}
        onChange={(e) => set('name', e.target.value)}
      />

      <label>Clan</label>
      <input
        value={sheet.clan ?? ''}
        onChange={(e) => set('clan', e.target.value)}
      />

      <label>Concept</label>
      <input
        value={sheet.concept ?? ''}
        onChange={(e) => set('concept', e.target.value)}
      />

      <label>Ambition</label>
      <input
        value={sheet.ambition ?? ''}
        onChange={(e) => set('ambition', e.target.value)}
      />

      <label>Desire</label>
      <input
        value={sheet.desire ?? ''}
        onChange={(e) => set('desire', e.target.value)}
      />

      <label>Notes</label>
      <textarea
        rows={4}
        value={sheet.notes ?? ''}
        onChange={(e) => set('notes', e.target.value)}
      />
    </div>
  );
}