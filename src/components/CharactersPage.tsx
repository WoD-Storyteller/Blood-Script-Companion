import HungerMeter from './HungerMeter';
import BloodPoolBar from './BloodPoolBar';
import AttributesBlock from './AttributesBlock';

export default function V5SheetRenderer({ sheet }: { sheet: any }) {
  if (!sheet) return null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="border-b border-blood-red/40 pb-3">
        <h2 className="text-2xl font-bold text-blood-crimson">
          {sheet.name}
        </h2>

        <div className="text-sm text-blood-bone">
          {sheet.clan} · {sheet.predator_type}
        </div>
      </div>

      {/* METERS */}
      <div className="grid grid-cols-2 gap-6">
        <HungerMeter hunger={sheet.hunger ?? 0} />
        <BloodPoolBar
          current={sheet.blood_pool ?? 0}
          max={sheet.blood_pool_max ?? 10}
        />
      </div>

      {/* ATTRIBUTES */}
      <div>
        <h3 className="text-lg font-semibold text-blood-crimson mb-4">
          Attributes
        </h3>

        <AttributesBlock sheet={sheet} />
      </div>

      {/* PLACEHOLDER */}
      <div className="text-sm text-blood-bone italic">
        Skills, Disciplines, Health, Willpower coming next…
      </div>
    </div>
  );
}