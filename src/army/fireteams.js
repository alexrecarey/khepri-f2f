// The fireteam size each unit's bonuses can reach, from the Army fireteam
// charts of every army (vanilla and sectorial). A unit gets the most generous
// team it appears in anywhere; the calculator doesn't check army lists.
//
//   Team sizes: Core 5 (or the army's own cap, e.g. "a maximum of 4
//   members"), Haris 3, Duo 2. A type counts only if the army may field it
//   (spec: vanilla armies have no Core).
//   Bonuses go by purity: the largest group of one unit in the team, members
//   that count as that unit included ("(Orc, Helot)"). A unit that is not
//   (and doesn't count as) the team's unit fills a slot without adding to it:
//   4 Fusiliers + 1 Bolt is a Core of purity 4. Below 2 there is no bonus.
//   Wildcards (a team with no type) join the army's other teams as an extra
//   member, counting only as what their comment names; "No Wildcards" teams
//   are skipped.
//   FTO entries ("BLADE FTO", comment "FTO ...") apply only to the unit's
//   FTO loadouts, kept apart as `fto`.
//
// Result: {slug: {all, fto}}, the purity each can reach, 0 when no team gets
// it to 2 (no fireteam option). A unit missing from the map never joins a
// fireteam.

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

// Whether `m` stands in for `group`: its own unit (a slug), or a name from a
// counts-as comment. That name is either another entry ("(Orc, Helot)") or a
// label several entries share ("(Steel Phalanx)", "(Undertow)").
function standsFor(m, group) {
  if (group === m.slug) return true;
  if (!group.startsWith('as:')) return false;
  const n = group.slice(3);
  const own = baseName(m.name);
  return countsAs(m.comment).includes(n) || (own && (own.startsWith(n) || n.startsWith(own)));
}

// The purity `x` can reach in one team. `x` is one of the team's entries, or
// a wildcard joining it from outside (extra).
function teamPurity(x, team, chart, fielded, extra = false) {
  const sizes = team.type.filter((t) => fielded.has(t)).map((t) => teamSize(t, chart));
  if (!sizes.length) return 0;
  const size = Math.max(...sizes);
  const members = (extra ? [...team.units, x] : team.units).filter((m) => m.slug);
  const groups = new Set(members.flatMap((m) => [m.slug, ...countsAs(m.comment).map((n) => `as:${n}`)]));
  let best = 0;
  for (const group of groups) {
    // Everyone who can stand in for the group, x included only if it does.
    const count = members.filter((m) => standsFor(m, group)).reduce((n, m) => n + m.max, 0);
    const purity = standsFor(x, group) ? Math.min(size, count) : Math.min(size - 1, count);
    best = Math.max(best, purity);
  }
  return best >= 2 ? best : 0;
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
    const typed = chart.teams.filter((t) => t.type.length);
    for (const team of chart.teams) {
      for (const entry of team.units) {
        if (!entry.slug) continue;
        const size = team.type.length
          ? teamPurity(entry, team, chart, fielded)
          : Math.max(0, ...typed.filter((t) => !/no wildcards/i.test(t.obs ?? '')).map((t) => teamPurity(entry, t, chart, fielded, true)));
        note(entry.slug, isFto(entry), size);
      }
    }
  }
  // An FTO loadout can always do what the unit's other loadouts can.
  for (const u of Object.values(out)) u.fto = Math.max(u.fto, u.all);
  return out;
}
