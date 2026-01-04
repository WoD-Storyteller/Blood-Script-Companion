type Props = {
  baneSeverity: number;
  description: string;
};

export default function BaneSeverityTracker({
  baneSeverity,
  description,
}: Props) {
  const max = 5;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm uppercase tracking-wide text-blood-crimson">
          Bane Severity
        </h3>

        <span className="text-xs text-blood-bone">
          {baneSeverity} / {max}
        </span>
      </div>

      <div className="flex gap-2 mb-2">
        {Array.from({ length: max }).map((_, i) => {
          const active = i < baneSeverity;

          return (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border transition-all ${
                active
                  ? 'bg-blood-crimson border-blood-red shadow-[0_0_8px_rgba(180,0,0,0.6)]'
                  : 'bg-blood-dark border-blood-red/40'
              }`}
            />
          );
        })}
      </div>

      <div className="p-3 bg-blood-dark rounded border border-blood-red/40 text-sm text-blood-bone">
        {description}
      </div>
    </div>
  );
}