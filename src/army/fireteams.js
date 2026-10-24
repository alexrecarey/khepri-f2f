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

/**
 * One army's fireteam chart, as scripts/fetch-army.mjs reads it from the
 * Army API: its teams, each a list of entries (a unit, how many of it may
 * join, its counts-as comment), the types the army may field (`spec`) and
 * the chart's prose (`desc`, a Core cap).
 * @typedef {{name: string, max: number, slug: string | null, comment?: string | null}} FireteamEntry
 * @typedef {{type: string[], units: FireteamEntry[], obs?: string | null}} FireteamTeam
 * @typedef {{teams?: FireteamTeam[], spec?: Record<string, number>, desc?: string | null}} FireteamChart
 */

/** @type {Record<string, number>} */
const SIZE = {DUO: 2, HARIS: 3, CORE: 5};

/** @param {string | null | undefined} comment */
const countsAs = (comment) => {
  const m = /\(([^)]*)\)/.exec(comment ?? '');
  return m ? m[1].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
};
/** @param {FireteamEntry} entry */
const isFto = (entry) => /\bFTO\b/.test(entry.name) || /^\s*FTO/.test(entry.comment ?? '');
// "REGULAR" for "REGULAR", "BLADE" for "BLADE FTO": what a counts-as comment names.
// "fusilier" for "FUSILIERS", "blade" for "BLADE FTO": names compared without
// case, FTO or a plural s.
/** @param {string} name */
const norm = (name) => name.replace(/\bFTO\b/g, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/s$/, '');
// A name matches a label word by word: "helot" covers "helot militiaman".
/**
 * @param {string} label
 * @param {string} name
 */
const covers = (label, name) => name === label || name.startsWith(`${label} `);

/** @param {FireteamChart} chart */
function coreCap(chart) {
  const m = /Core have a maximum of (\d+)/i.exec(chart.desc ?? '');
  return m ? Number(m[1]) : SIZE.CORE;
}

/**
 * @param {string} type
 * @param {FireteamChart} chart
 */
function teamSize(type, chart) {
  return type === 'CORE' ? coreCap(chart) : SIZE[type];
}

// Whether `m` stands in for `group`: "n:<name>", an entry's own name, or
// "l:<label>", a name from a counts-as comment. A label means another entry
// ("(Orc Troops)" for ORC) or a name several entries share ("(Steel
// Phalanx)", "(Undertow)"), so labels and names match word by word either
// way; two entry names must be equal (Zhanshi is not Zhanshi Yisheng, and
// Scarface is not Cordelia Turner though Army sells them as one unit).
/**
 * @param {FireteamEntry} m
 * @param {string} group
 */
function standsFor(m, group) {
  const kind = group.slice(0, 2);
  const n = group.slice(2);
  const own = norm(m.name);
  const labels = countsAs(m.comment).map(norm);
  if (kind === 'n:') return own === n || labels.some((c) => covers(c, n) || covers(n, c));
  return labels.includes(n) || covers(n, own) || covers(own, n);
}

// The purity `x` can reach in one team. `x` is one of the team's entries, or
// a wildcard joining it from outside (extra).
/**
 * @param {FireteamEntry} x
 * @param {FireteamTeam} team
 * @param {FireteamChart} chart
 * @param {Set<string>} fielded
 * @param {boolean} [extra]
 */
function teamPurity(x, team, chart, fielded, extra = false) {
  const sizes = team.type.filter((t) => fielded.has(t)).map((t) => teamSize(t, chart));
  if (!sizes.length) return 0;
  const size = Math.max(...sizes);
  const members = (extra ? [...team.units, x] : team.units).filter((m) => m.slug);
  const groups = new Set(members.flatMap((m) => [`n:${norm(m.name)}`, ...countsAs(m.comment).map((c) => `l:${norm(c)}`)]));
  let best = 0;
  for (const group of groups) {
    // Everyone who can stand in for the group, x included only if it does.
    const count = members.filter((m) => standsFor(m, group)).reduce((n, m) => n + m.max, 0);
    const purity = standsFor(x, group) ? Math.min(size, count) : Math.min(size - 1, count);
    best = Math.max(best, purity);
  }
  return best >= 2 ? best : 0;
}

/**
 * @param {(FireteamChart | null | undefined)[]} charts
 * @returns {Record<string, {all: number, fto: number}>}
 */
export function fireteamLimits(charts) {
  /** @type {Record<string, {all: number, fto: number}>} */
  const out = {};
  /**
   * @param {string} slug
   * @param {boolean} fto
   * @param {number} size
   */
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
