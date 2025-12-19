export type TabKey = 'world' | 'characters' | 'coteries';

export default function NavTabs({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const btn = (key: TabKey, label: string) => (
    <button
      onClick={() => onChange(key)}
      style={{
        marginRight: 8,
        padding: '8px 12px',
        fontWeight: tab === key ? 700 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      {btn('world', 'World')}
      {btn('characters', 'Characters')}
      {btn('coteries', 'Coteries')}
    </div>
  );
}