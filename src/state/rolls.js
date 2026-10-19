// Saved rolls (lists.saved): the setup to load back, plus a summary for the
// Saved rolls list, so the list shows without running the engine again.
//   {id, mode, savedAt, setup, summary: {a, r, ad, rd, setup, ap, rp, ...}}
//   a / r     who rolls: "Squalos · HMG" (Matchup) or "Active" (Classic)
//   ad / rd   dice lines: "B4 SV15 PS7"
//   setup     the situation: '24-32" · Cover · Fireteam 5'
//   ap / rp   chance each side wins (or, not face to face, causes a wound)
// Matchup only, since the crest rows (rolls saved before have none of these;
// rollRow() makes do with a / r):
//   au / aw, ru / rw   unit and weapon, apart: "Squalos Mk-II", "HMG"
//   ca / cr            unit crest slugs (src/army/crests.js)
//   fa / fr            vanilla faction ids, whose crest stands in
import {RANGE_BANDS} from '../rules/ranges.js';
import {shortIsc, shortWeaponName} from '../army/names.js';
import {DEFAULT_PARAMS} from '../engine/params.js';
import {MODES} from './modes.js';
import {ZONES, ZONE_NAME} from '../rules/visibility.js';
import {pseudoName} from '../rules/trooper.js';
import {DEFAULT_RANGE_CM, EMPTY_SIDE, NO_ZONES} from './schema.js';

const pct0 = (p) => `${Math.round(100 * p)}%`;
const shortUnit = (unit) => shortIsc(unit.isc);

// A saved setup with today's fields: a roll saved before a field existed gets
// its default, so it loads complete and matches the same setup saved now.
export function normalizeSetup(mode, setup) {
  if (mode === MODES.matchup) {
    return {
      ...NO_ZONES, ...setup,
      A: {...EMPTY_SIDE, ...setup?.A}, B: {...EMPTY_SIDE, ...setup?.B}, rangeCm: setup?.rangeCm ?? DEFAULT_RANGE_CM,
      rangeCmB: setup?.rangeCmB ?? null,
    };
  }
  return {...DEFAULT_PARAMS, ...setup};
}

// JSON with object keys sorted, so key order never makes two setups differ.
const canonical = (x) => (Array.isArray(x) ? x.map(canonical)
  : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, canonical(x[k])])) : x);

// The roll's identity: two rolls with the same setup are the same roll.
export const setupKey = (mode, setup) => JSON.stringify(canonical([mode, normalizeSetup(mode, setup)]));

export function currentSetup(state) {
  return state.mode === MODES.matchup ? state.matchup : state.classic;
}

function chances(s) {
  if (!s) return {ap: '', rp: ''};
  if (s.unopposed) return {ap: pct0(s.attacks.active.wounded), rp: pct0(s.attacks.reactive.wounded)};
  return {ap: pct0(s.win.active), rp: pct0(s.win.reactive)};
}

function weaponShort(w) {
  if (!w) return '';
  if (w.pseudo) return pseudoName(w);
  return shortWeaponName(w.name);
}

// What a side's situation says, for the saved-rolls line and the share card.
// A sapper's cover is its Foxhole, so it never says Cover as well.
const inFoxhole = (x) => Boolean(x.resolved.sapper);
const inCover = (x) => x.sel.inCover && !x.resolved.sapper;
const fireteam = (x) => (x.resolved.ftSize > 1 ? `Fireteam ${x.resolved.ftSize}` : null);
const surprise = (x, role) => role === 'A' && x.sel.surpriseAttack;
const bandAt = (cm) => RANGE_BANDS.find((b) => b.to === cm)?.label ?? null;
// '24-32"', or each side's when the range is split: '24-32" / 32-40"';
// 'Close combat' when both are in CC (no range plays a part).
const rangeText = (view) => {
  if (view.rangeUnused) return 'Close combat';
  return view.rangeCmB == null ? bandAt(view.rangeCm) : `${bandAt(view.rangeCm)} / ${bandAt(view.rangeCmB)}`;
};
// Smoke / White Noise between them, by name.
const zoneNames = (view) => ZONES.filter((z) => view.zones?.[z]).map((z) => ZONE_NAME[z]);

// view: matchupView(); s: results.js summarize()
export function matchupRollSummary(view, s) {
  const {A, B} = view;
  const bits = [rangeText(view), ...zoneNames(view)];
  if (inFoxhole(A) || inFoxhole(B)) bits.push('Foxhole');
  if (inCover(A) || inCover(B)) bits.push('Cover');
  for (const x of [A, B]) bits.push(fireteam(x));
  if (surprise(A, 'A')) bits.push('Surprise attack');
  const [au, aw, ru, rw] = [shortUnit(A.resolved.unit), weaponShort(A.resolved.weapon), shortUnit(B.resolved.unit), weaponShort(B.resolved.weapon)];
  return {
    a: `${au} · ${aw}`,
    r: `${ru} · ${rw}`,
    au, aw, ru, rw,
    ca: A.crest, cr: B.crest,
    fa: A.vanilla, fr: B.vanilla,
    ad: view.ledger?.ledger.A?.dice ?? '',
    rd: view.ledger?.ledger.B?.dice ?? '',
    setup: bits.filter(Boolean).join(' · '),
    ...chances(s),
  };
}

// The share card for a complete matchup (src/share/card.js): who rolls, with
// what and how, plus the headline the sender sees. h: ui/headline.js headline().
export function matchupShareCard(view, h) {
  const side = (role, key) => {
    const x = view[role];
    const situation = [inFoxhole(x) && 'Foxhole', inCover(x) && 'Cover', fireteam(x), surprise(x, role) && 'Surprise attack'];
    return {
      n: h.text[key], l: h.label[key],
      u: shortUnit(x.resolved.unit), w: weaponShort(x.resolved.weapon), s: situation.filter(Boolean).join(', '),
      c: x.crest ?? '',
    };
  };
  return {k: h.kind, nf: h.fallback, x: [rangeText(view), ...zoneNames(view)].filter(Boolean).join(' · '), a: side('A', 'active'), b: side('B', 'reactive')};
}

const classicDice = (p, side) => {
  const sd = p[`bonusBurst${side}`];
  return `B${p[`burst${side}`]}${sd ? `+${sd}` : ''} SV${p[`successValue${side}`]} PS${p[`damage${side}`]}`;
};

export function classicRollSummary(params, s) {
  return {
    a: 'Active',
    r: 'Reactive',
    ad: classicDice(params, 'A'),
    rd: classicDice(params, 'B'),
    setup: [params.ammoA, params.ammoB].join(' vs '),
    ...chances(s),
  };
}

// A Matchup roll's crest row: {au, aw, ru, rw, ca, cr, fa, fr, setup}. Rolls
// saved before the crests have only "Squalos · HMG"; split that, no crests.
export function rollRow(summary) {
  if (summary.au != null) return summary;
  const [au = summary.a, aw = ''] = summary.a.split(' · ');
  const [ru = summary.r, rw = ''] = summary.r.split(' · ');
  return {...summary, au, aw, ru, rw, ca: null, cr: null, fa: null, fr: null};
}

export function makeRoll({mode, setup, summary, now = Date.now()}) {
  return {id: `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, mode, savedAt: now, setup, summary};
}
