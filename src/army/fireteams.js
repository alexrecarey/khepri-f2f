// The largest fireteam each unit can join, from the Army fireteam charts of
// every army (vanilla and sectorial). A simplified subset of the rules: the
// calculator only needs "can this trooper be in a fireteam, and how big", so
// each unit gets the most generous team it appears in anywhere.
//
//   Core 5 (or the army's own Core cap, e.g. "a maximum of 4 members"),
//   Haris 3, Duo 2. A team type counts only if the army may field it
//   (spec: vanilla armies have no Core).
//   A Duo counts only if it can be pure: the unit may appear twice
//   (max >= 2) or counts as another unit of the same team ("(Orc, Helot)").
//   Otherwise the Duo gives no bonus, so it is ignored.
//   Wildcards (a team with no type) can join any team type the army fields.
//   FTO entries ("BLADE FTO", comment "FTO ...") apply only to the unit's
//   FTO loadouts, kept apart as `fto`.
//
// Result: {slug: {all, fto}}, each the max size, 0 when the unit appears only
// in Duos it can't make pure (no fireteam option). A unit missing from the
// map never joins a fireteam.

const SIZE = {DUO: 2, HARIS: 3, CORE: 5};

const countsAs = (comment) => {
  const m = /\(([^)]*)\)/.exec(comment ?? '');
  return m ? m[1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
};
const isFto = (entry) => /\bFTO\b/.test(entry.name) || /^\s*FTO/.test(entry.comment ?? '');
// "REGULAR" for "REGULAR", "BLADE" for "BLADE FTO": what a counts-as comment names.
const baseName = (name) => name.replace(/\bFTO\b/g, '').trim().toLowerCase();

function coreCap(chart) {
  const m = /Core have a maximum of (\d+)/i.exec(chart.desc ?? '');
  return m ? Number(m[1]) : SIZE.CORE;
}

function teamSize(type, chart) {
  return type === 'CORE' ? coreCap(chart) : SIZE[type];
}

// Sizes one entry of one team can reach.
function entrySize(entry, team, chart, fielded) {
  let best = 0;
  for (const type of team.type) {
    if (!fielded.has(type)) continue;
    if (type === 'DUO') {
      const others = team.units.filter((u) => u !== entry).map((u) => baseName(u.name));
      const pure = entry.max >= 2 || countsAs(entry.comment).some((n) => others.some((o) => o.startsWith(n) || n.startsWith(o)));
      if (!pure) continue;
    }
    best = Math.max(best, teamSize(type, chart));
  }
  return best;
}

export function fireteamLimits(charts) {
  const out = {};
  const note = (slug, fto, size) => {
    const u = (out[slug] ??= {all: 0, fto: 0});
    if (fto) u.fto = Math.max(u.fto, size);
    else u.all = Math.max(u.all, size);
  };
  for (const chart of charts) {
    if (!chart?.teams) continue;
    const fielded = new Set(Object.entries(chart.spec ?? {}).filter(([, n]) => n > 0).map(([t]) => t));
    const wildcardSize = Math.max(0, ...[...fielded].filter((t) => t !== 'DUO').map((t) => teamSize(t, chart)));
    for (const team of chart.teams) {
      for (const entry of team.units) {
        if (!entry.slug) continue;
        const size = team.type.length ? entrySize(entry, team, chart, fielded) : wildcardSize;
        note(entry.slug, isFto(entry), size);
      }
    }
  }
  // An FTO loadout can always do what the unit's other loadouts can.
  for (const u of Object.values(out)) u.fto = Math.max(u.fto, u.all);
  return out;
}
