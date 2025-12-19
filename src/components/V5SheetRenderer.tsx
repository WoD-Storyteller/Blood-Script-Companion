import React from 'react';

type AnyObj = Record<string, any>;

function get(obj: AnyObj | null | undefined, path: string[], fallback: any = undefined) {
  let cur: any = obj;
  for (const p of path) {
    if (cur == null) return fallback;
    cur = cur[p];
  }
  return cur ?? fallback;
}

function asInt(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function dotRow(count: number, max: number) {
  const c = Math.max(0, Math.min(max, asInt(count, 0)));
  const arr = new Array(max).fill(0).map((_, i) => (i < c ? '●' : '○'));
  return <span style={{ letterSpacing: 2 }}>{arr.join(' ')}</span>;
}

function tag(text: string) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        border: '1px solid #ddd',
        borderRadius: 999,
        fontSize: 12,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {text}
    </span>
  );
}

const ATTR_ORDER = [
  ['Strength', 'Dexterity', 'Stamina'],
  ['Charisma', 'Manipulation', 'Composure'],
  ['Intelligence', 'Wits', 'Resolve'],
];

const SKILL_ORDER = [
  ['Athletics', 'Brawl', 'Craft', 'Drive', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival'],
  ['Animal Ken', 'Etiquette', 'Insight', 'Intimidation', 'Leadership', 'Performance', 'Persuasion', 'Streetwise', 'Subterfuge'],
  ['Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine', 'Occult', 'Politics', 'Science', 'Technology'],
];

function normalizeKey(s: string) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function readPoolMap(sheet: AnyObj, candidates: string[]): AnyObj | null {
  for (const c of candidates) {
    const v = sheet?.[c];
    if (v && typeof v === 'object') return v;
  }
  return null;
}

function readStat(sheet: AnyObj, kind: 'attributes' | 'skills', name: string): number {
  // Common layouts supported:
  // sheet.attributes.strength = 3
  // sheet.attributes.Strength = 3
  // sheet.attributes = [{name, value}]
  // sheet.system.attributes (Foundry-ish)
  const directMaps = [
    readPoolMap(sheet, ['attributes', 'attribute', 'attrs']),
    readPoolMap(sheet, ['skills', 'skill']),
    readPoolMap(sheet?.system || {}, ['attributes', 'skills']),
    readPoolMap(sheet?.data || {}, ['attributes', 'skills']),
  ].filter(Boolean) as AnyObj[];

  const want = normalizeKey(name);

  for (const m of directMaps) {
    // object map
    if (!Array.isArray(m)) {
      for (const k of Object.keys(m)) {
        if (normalizeKey(k) === want) return asInt(m[k], 0);
        // foundry-ish: m[k].value
        if (normalizeKey(k) === want && typeof m[k] === 'object') {
          const vv = m[k]?.value ?? m[k]?.rating ?? m[k]?.dots;
          if (vv != null) return asInt(vv, 0);
        }
        if (typeof m[k] === 'object') {
          const label = m[k]?.name ?? m[k]?.label;
          if (label && normalizeKey(label) === want) {
            const vv = m[k]?.value ?? m[k]?.rating ?? m[k]?.dots;
            if (vv != null) return asInt(vv, 0);
          }
        }
      }
    }

    // array list
    if (Array.isArray(m)) {
      const found = m.find((x: any) => normalizeKey(x?.name) === want || normalizeKey(x?.label) === want);
      if (found) {
        const vv = found?.value ?? found?.rating ?? found?.dots;
        return asInt(vv, 0);
      }
    }
  }

  // if kind-specific map exists
  const map = kind === 'attributes'
    ? readPoolMap(sheet, ['attributes', 'attribute', 'attrs']) || readPoolMap(sheet?.system || {}, ['attributes'])
    : readPoolMap(sheet, ['skills', 'skill']) || readPoolMap(sheet?.system || {}, ['skills']);

  if (map && !Array.isArray(map)) {
    for (const k of Object.keys(map)) {
      if (normalizeKey(k) === want) {
        const v = typeof map[k] === 'object' ? (map[k]?.value ?? map[k]?.rating ?? map[k]?.dots) : map[k];
        return asInt(v, 0);
      }
    }
  }

  return 0;
}

function readDisciplines(sheet: AnyObj): Array<{ name: string; dots: number; powers?: string[] }> {
  const d = sheet?.disciplines ?? sheet?.system?.disciplines ?? sheet?.data?.disciplines;
  if (!d) return [];

  // array form
  if (Array.isArray(d)) {
    return d
      .map((x: any) => ({
        name: String(x?.name ?? x?.label ?? 'Discipline'),
        dots: asInt(x?.dots ?? x?.value ?? x?.rating ?? 0, 0),
        powers: Array.isArray(x?.powers) ? x.powers.map((p: any) => String(p)) : undefined,
      }))
      .filter((x) => x.name);
  }

  // object map form
  if (typeof d === 'object') {
    const out: Array<{ name: string; dots: number; powers?: string[] }> = [];
    for (const k of Object.keys(d)) {
      const v = d[k];
      if (v == null) continue;
      const name = String(v?.name ?? v?.label ?? k);
      const dots = asInt(v?.dots ?? v?.value ?? v?.rating ?? v?.level ?? 0, 0);
      const powers = Array.isArray(v?.powers) ? v.powers.map((p: any) => String(p)) : undefined;
      out.push({ name, dots, powers });
    }
    return out;
  }

  return [];
}

function readList(sheet: AnyObj, keys: string[]): any[] {
  for (const k of keys) {
    const v = sheet?.[k] ?? sheet?.system?.[k] ?? sheet?.data?.[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}

function readText(sheet: AnyObj, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const v = sheet?.[k] ?? sheet?.system?.[k] ?? sheet?.data?.[k];
    if (typeof v === 'string' && v.trim().length) return v;
  }
  return fallback;
}

function readNum(sheet: AnyObj, keys: string[], fallback = 0): number {
  for (const k of keys) {
    const v = sheet?.[k] ?? sheet?.system?.[k] ?? sheet?.data?.[k];
    if (v != null) return asInt(v, fallback);
  }
  return fallback;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h3>
      {children}
    </section>
  );
}

function TwoCol({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export default function V5SheetRenderer({ sheet }: { sheet: AnyObj }) {
  const name = readText(sheet, ['name', 'character_name'], 'Unnamed');
  const clan = readText(sheet, ['clan'], readText(sheet, ['bloodline'], ''));
  const concept = readText(sheet, ['concept'], '');
  const predatorType = readText(sheet, ['predatorType', 'predator_type'], '');
  const chronicle = readText(sheet, ['chronicle'], '');
  const ambition = readText(sheet, ['ambition'], '');
  const desire = readText(sheet, ['desire'], '');

  const generation = readText(sheet, ['generation'], '');
  const sire = readText(sheet, ['sire'], '');
  const sect = readText(sheet, ['sect'], '');
  const coterie = readText(sheet, ['coterie'], '');

  const bloodPotency = readNum(sheet, ['bloodPotency', 'blood_potency'], 0);
  const humanity = readNum(sheet, ['humanity'], 7);
  const stains = readNum(sheet, ['stains'], 0);
  const hunger = readNum(sheet, ['hunger'], 0);

  const healthMax = readNum(sheet, ['healthMax', 'health_max'], 0);
  const healthCur = readNum(sheet, ['health', 'healthCurrent', 'health_current'], 0);

  const willMax = readNum(sheet, ['willpowerMax', 'willpower_max'], 0);
  const willCur = readNum(sheet, ['willpower', 'willpowerCurrent', 'willpower_current'], 0);

  const resonance = readText(sheet, ['resonance'], '');
  const bane = readText(sheet, ['bane'], '');
  const compulsion = readText(sheet, ['compulsion'], '');

  const disciplines = readDisciplines(sheet);

  const merits = readList(sheet, ['merits', 'advantages', 'backgrounds']).map((x: any) =>
    typeof x === 'string' ? x : (x?.name ? `${x.name}${x?.dots != null ? ` (${x.dots})` : ''}` : JSON.stringify(x)),
  );

  const flaws = readList(sheet, ['flaws']).map((x: any) =>
    typeof x === 'string' ? x : (x?.name ? `${x.name}${x?.dots != null ? ` (${x.dots})` : ''}` : JSON.stringify(x)),
  );

  const convictions = readList(sheet, ['convictions']).map((x: any) => (typeof x === 'string' ? x : JSON.stringify(x)));
  const touchstones = readList(sheet, ['touchstones']).map((x: any) => (typeof x === 'string' ? x : JSON.stringify(x)));

  const notes = readText(sheet, ['notes', 'bio', 'biography'], '');

  const xpTotal = readNum(sheet, ['xpTotal', 'xp_total', 'xp'], 0);
  const xpSpent = readNum(sheet, ['xpSpent', 'xp_spent'], 0);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{name}</h2>
        <div style={{ marginTop: 6 }}>
          {clan && tag(`Clan: ${clan}`)}
          {concept && tag(`Concept: ${concept}`)}
          {predatorType && tag(`Predator: ${predatorType}`)}
          {sect && tag(`Sect: ${sect}`)}
          {coterie && tag(`Coterie: ${coterie}`)}
          {chronicle && tag(`Chronicle: ${chronicle}`)}
        </div>
      </div>

      <TwoCol
        left={
          <Section title="Trackers">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div><strong>Hunger</strong></div>
                <div>{dotRow(hunger, 5)}</div>
              </div>
              <div>
                <div><strong>Blood Potency</strong></div>
                <div>{bloodPotency}</div>
              </div>
              <div>
                <div><strong>Humanity</strong></div>
                <div>{dotRow(humanity, 10)}</div>
              </div>
              <div>
                <div><strong>Stains</strong></div>
                <div>{stains}</div>
              </div>
              <div>
                <div><strong>Health</strong></div>
                <div>{healthMax ? `${healthCur}/${healthMax}` : String(healthCur || 0)}</div>
              </div>
              <div>
                <div><strong>Willpower</strong></div>
                <div>{willMax ? `${willCur}/${willMax}` : String(willCur || 0)}</div>
              </div>
            </div>

            {(resonance || bane || compulsion) && (
              <div style={{ marginTop: 12 }}>
                {resonance && <div><strong>Resonance:</strong> {resonance}</div>}
                {bane && <div><strong>Bane:</strong> {bane}</div>}
                {compulsion && <div><strong>Compulsion:</strong> {compulsion}</div>}
              </div>
            )}
          </Section>
        }
        right={
          <Section title="Identity">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <strong>Ambition</strong>
                <div style={{ opacity: 0.9 }}>{ambition || '—'}</div>
              </div>
              <div>
                <strong>Desire</strong>
                <div style={{ opacity: 0.9 }}>{desire || '—'}</div>
              </div>
              <div>
                <strong>Generation</strong>
                <div style={{ opacity: 0.9 }}>{generation || '—'}</div>
              </div>
              <div>
                <strong>Sire</strong>
                <div style={{ opacity: 0.9 }}>{sire || '—'}</div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>XP</strong>
              <div style={{ opacity: 0.9 }}>
                Total: {xpTotal} {xpSpent ? `• Spent: ${xpSpent}` : ''}
              </div>
            </div>
          </Section>
        }
      />

      <TwoCol
        left={
          <Section title="Attributes">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {ATTR_ORDER.flat().map((a) => (
                <div key={a}>
                  <div style={{ fontWeight: 600 }}>{a}</div>
                  <div>{dotRow(readStat(sheet, 'attributes', a), 5)}</div>
                </div>
              ))}
            </div>
          </Section>
        }
        right={
          <Section title="Skills">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {SKILL_ORDER.flat().map((s) => (
                <div key={s}>
                  <div style={{ fontWeight: 600 }}>{s}</div>
                  <div>{dotRow(readStat(sheet, 'skills', s), 5)}</div>
                </div>
              ))}
            </div>
          </Section>
        }
      />

      <TwoCol
        left={
          <Section title="Disciplines">
            {disciplines.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No disciplines found in sheet data.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {disciplines
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((d) => (
                    <div key={d.name} style={{ border: '1px solid #eee', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontWeight: 700 }}>{d.name}</div>
                      <div style={{ marginTop: 4 }}>{dotRow(d.dots, 5)}</div>
                      {Array.isArray(d.powers) && d.powers.length > 0 && (
                        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18, opacity: 0.9 }}>
                          {d.powers.map((p, idx) => (
                            <li key={`${d.name}-${idx}`}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </Section>
        }
        right={
          <Section title="Merits & Flaws">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Merits / Advantages</div>
                {merits.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>—</div>
                ) : (
                  <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                    {merits.map((m, i) => <li key={`m-${i}`}>{m}</li>)}
                  </ul>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Flaws</div>
                {flaws.length === 0 ? (
                  <div style={{ opacity: 0.8 }}>—</div>
                ) : (
                  <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                    {flaws.map((f, i) => <li key={`f-${i}`}>{f}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </Section>
        }
      />

      <TwoCol
        left={
          <Section title="Convictions">
            {convictions.length === 0 ? (
              <div style={{ opacity: 0.8 }}>—</div>
            ) : (
              <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                {convictions.map((c, i) => <li key={`c-${i}`}>{c}</li>)}
              </ul>
            )}
          </Section>
        }
        right={
          <Section title="Touchstones">
            {touchstones.length === 0 ? (
              <div style={{ opacity: 0.8 }}>—</div>
            ) : (
              <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                {touchstones.map((t, i) => <li key={`t-${i}`}>{t}</li>)}
              </ul>
            )}
          </Section>
        }
      />

      {notes && (
        <Section title="Notes">
          <div style={{ whiteSpace: 'pre-wrap', opacity: 0.95 }}>{notes}</div>
        </Section>
      )}

      <Section title="Raw Sheet Data (fallback)">
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          If something isn’t rendering above, it should still exist here for debugging / schema alignment.
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 12, borderRadius: 8 }}>
          {JSON.stringify(sheet, null, 2)}
        </pre>
      </Section>
    </div>
  );
}