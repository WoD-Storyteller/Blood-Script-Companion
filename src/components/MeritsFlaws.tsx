type Trait = {
  name: string;
  dots: number;
  description?: string;
};

export default function MeritsFlawsPanel({
  merits,
  flaws,
}: {
  merits: Trait[];
  flaws: Trait[];
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm uppercase tracking-wide text-blood-crimson mb-2">
          Merits
        </h3>

        <div className="space-y-2">
          {merits.map((m) => (
            <div
              key={m.name}
              className="p-2 bg-blood-dark rounded border border-blood-red/40"
            >
              <div className="flex justify-between">
                <span>{m.name}</span>
                <span>{'●'.repeat(m.dots)}</span>
              </div>

              {m.description && (
                <p className="text-xs text-blood-bone mt-1">
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-wide text-blood-crimson mb-2">
          Flaws
        </h3>

        <div className="space-y-2">
          {flaws.map((f) => (
            <div
              key={f.name}
              className="p-2 bg-blood-dark rounded border border-blood-red/40"
            >
              <div className="flex justify-between">
                <span>{f.name}</span>
                <span>{'●'.repeat(f.dots)}</span>
              </div>

              {f.description && (
                <p className="text-xs text-blood-bone mt-1">
                  {f.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}