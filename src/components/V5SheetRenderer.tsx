import React from 'react';

/* =========================
   UI ATOMS
========================= */

function Dot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full border
        ${filled
          ? 'bg-blood-red border-blood-crimson shadow-[0_0_6px_rgba(180,0,0,0.6)]'
          : 'border-blood-red/40'}
      `}
    />
  );
}

function DotTrack({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Dot key={i} filled={i < value} />
      ))}
    </div>
  );
}

function HungerMeter({ hunger }: { hunger: number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-blood-crimson mb-1">
        Hunger
      </div>
      <DotTrack value={hunger} max={5} />
    </div>
  );
}

function BloodPoolBar({ current, max }: { current: number; max: number }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div>
      <div className="flex justify-between text-xs uppercase text-blood-bone mb-1">
        <span>Blood</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div className="h-2 rounded bg-blood-dark border border-blood-red/40 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blood-red to-blood-crimson transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* =========================
   SECTION COMPONENTS
========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm uppercase tracking-wider text-blood-crimson mb-2 border-b border-blood-red/40 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  max = 5,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm">{label}</span>
      <DotTrack value={value} max={max} />
    </div>
  );
}

/* =========================
   MAIN RENDERER
========================= */

export default function V5SheetRenderer({ sheet }: { sheet: any }) {
  if (!sheet) return null;

  const attrs = sheet.attributes ?? {};
  const skills = sheet.skills ?? {};
  const disciplines = sheet.disciplines ?? {};

  return (
    <div className="text-blood-bone font-serif">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blood-crimson">
          {sheet.name}
        </h2>
        <div className="text-sm opacity-80">
          {sheet.clan} · {sheet.generation}th Gen · Humanity {sheet.humanity}
        </div>
      </div>

      {/* METERS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <HungerMeter hunger={sheet.hunger ?? 0} />
        <BloodPoolBar
          current={sheet.blood?.current ?? 0}
          max={sheet.blood?.max ?? 10}
        />
      </div>

      {/* ATTRIBUTES */}
      <Section title="Attributes">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <StatRow label="Strength" value={attrs.strength ?? 0} />
            <StatRow label="Dexterity" value={attrs.dexterity ?? 0} />
            <StatRow label="Stamina" value={attrs.stamina ?? 0} />
          </div>
          <div>
            <StatRow label="Charisma" value={attrs.charisma ?? 0} />
            <StatRow label="Manipulation" value={attrs.manipulation ?? 0} />
            <StatRow label="Composure" value={attrs.composure ?? 0} />
          </div>
          <div>
            <StatRow label="Intelligence" value={attrs.intelligence ?? 0} />
            <StatRow label="Wits" value={attrs.wits ?? 0} />
            <StatRow label="Resolve" value={attrs.resolve ?? 0} />
          </div>
        </div>
      </Section>

      {/* SKILLS */}
      <Section title="Skills">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <StatRow label="Athletics" value={skills.athletics ?? 0} />
            <StatRow label="Brawl" value={skills.brawl ?? 0} />
            <StatRow label="Stealth" value={skills.stealth ?? 0} />
          </div>
          <div>
            <StatRow label="Persuasion" value={skills.persuasion ?? 0} />
            <StatRow label="Subterfuge" value={skills.subterfuge ?? 0} />
            <StatRow label="Insight" value={skills.insight ?? 0} />
          </div>
          <div>
            <StatRow label="Academics" value={skills.academics ?? 0} />
            <StatRow label="Occult" value={skills.occult ?? 0} />
            <StatRow label="Technology" value={skills.technology ?? 0} />
          </div>
        </div>
      </Section>

      {/* DISCIPLINES */}
      <Section title="Disciplines">
        {Object.keys(disciplines).length === 0 && (
          <div className="text-sm opacity-60">None</div>
        )}

        {Object.entries(disciplines).map(([name, level]: any) => (
          <StatRow
            key={name}
            label={name}
            value={level}
            max={5}
          />
        ))}
      </Section>
    </div>
  );
}