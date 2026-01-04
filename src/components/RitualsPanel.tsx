type Ritual = {
  name: string;
  level: number;
  discipline: 'Blood Sorcery' | 'Oblivion';
  description?: string;
};

export default function RitualsPanel({
  rituals,
}: {
  rituals: Ritual[];
}) {
  if (!rituals.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm uppercase tracking-wide text-blood-crimson mb-2">
        Rituals
      </h3>

      <div className="space-y-3">
        {rituals.map((r) => (
          <div
            key={r.name}
            className="p-3 bg-blood-dark rounded border border-blood-red/40"
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium">{r.name}</span>
              <span className="text-xs text-blood-bone">
                ●{r.level} {r.discipline}
              </span>
            </div>

            {r.description && (
              <p className="text-sm text-blood-bone">
                {r.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}