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
import {ccAllies, usesBerserk} from '../rules/closeCombat.js';
import {hackedResetMod, immADodgeMod, targetedMod} from '../rules/modifiers.js';
import {RANGE_BANDS, bandLabel} from '../rules/ranges.js';
import {shortIsc, shortWeaponName} from '../army/names.js';
import {DEFAULT_PARAMS} from '../engine/params.js';
import {MODES} from './modes.js';
import {classicAmmoKey} from './classicView.js';
import {ZONES, zoneName} from '../rules/visibility.js';
import {pseudoName} from '../rules/trooper.js';
import {DEFAULT_RANGE_CM, EMPTY_SIDE, NO_ZONES} from './schema.js';
import {tEn} from '../i18n/index.js';

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

function weaponShort(w, t) {
  if (!w) return '';
  if (w.pseudo) return pseudoName(w, t);
  // A CC Mode says so: "Kobra Pistol (CC)", not the same as its shot.
  return `${shortWeaponName(w.name, t.lang)}${w.cc && w.mode ? ` (${t('abbr.CC')})` : ''}`;
}

// What a side's situation says, for the saved-rolls line and the share card.
// A sapper's cover is its Foxhole, so it never says Cover as well. A hacked
// side's cover does nothing; its Firewall chip says what it has instead.
const inFoxhole = (x) => Boolean(x.resolved.sapper) && !x.hacked;
const inCover = (x) => x.sel.inCover && !x.resolved.sapper && !x.hacked;
const firewall = (x, t) => (x.hacked && x.resolved.firewall ? t('roll.firewall', {mod: x.resolved.firewall}) : null);
// The situation chips on the side's own roll, while its pick uses them.
const ownChips = (x, t) => [
  targetedMod(x.resolved) && t('chip.targeted'),
  hackedResetMod(x.resolved) && `${t('chip.hacked')} (${hackedResetMod(x.resolved)})`,
  immADodgeMod(x.resolved) && t('chip.immA'),
];
// Only while it gives the pick a bonus (the chip is hidden otherwise).
const fireteam = (x, t) => (x.fireteamChip && x.resolved.ftSize > 1 ? t('ledger.fireteam', {size: x.resolved.ftSize}) : null);
const surprise = (x, role) => role === 'A' && x.sel.surpriseAttack;
const berserk = (x, role) => usesBerserk(x.resolved, role === 'A');
// Allies in contact, as the CC Attack counts them (closeCombat.js ccAllies).
const allies = (x, y, t) => {
  const n = x.cc ? ccAllies(x.resolved, y.resolved) : 0;
  return n ? t('roll.allies', {count: n}) : null;
};
// Team-Ops picks by their chart labels: "Team-Ops: BS+1", "TacBall: Jammer".
const teamOps = (x) => {
  const ops = x.teamOps;
  if (!ops) return [];
  const at = (list, i) => (i != null ? list[i] : null);
  return [at(ops.chart, x.sel.upgrade) && `Team-Ops: ${at(ops.chart, x.sel.upgrade)}`, at(ops.ball, x.sel.ball) && `TacBall: ${at(ops.ball, x.sel.ball)}`];
};
const bandAt = (cm, t) => {
  const i = RANGE_BANDS.findIndex((b) => b.to === cm);
  return i < 0 ? null : bandLabel(i, t);
};
// '24-32"', or each side's when the range is split: '24-32" / 32-40"';
// 'Close combat' when both are in CC (no range plays a part).
const rangeText = (view, t) => {
  if (view.rangeUnused) return t('roll.closeCombat');
  return view.rangeCmB == null ? bandAt(view.rangeCm, t) : `${bandAt(view.rangeCm, t)} / ${bandAt(view.rangeCmB, t)}`;
};
// Smoke / White Noise between them, by name.
const zoneNames = (view, t) => ZONES.filter((z) => view.zones?.[z]).map((z) => zoneName(z, t));

// view: matchupView(); s: results.js summarize(). The summary is saved as
// text, in the language it was saved in.
export function matchupRollSummary(view, s, t = tEn) {
  const {A, B} = view;
  const bits = [rangeText(view, t), ...zoneNames(view, t)];
  if (inFoxhole(A) || inFoxhole(B)) bits.push(t('skill.foxhole'));
  if (inCover(A) || inCover(B)) bits.push(t('roll.cover'));
  bits.push(firewall(A, t), firewall(B, t), ...ownChips(A, t), ...ownChips(B, t));
  for (const x of [A, B]) bits.push(fireteam(x, t), ...teamOps(x));
  bits.push(allies(A, B, t), allies(B, A, t));
  if (surprise(A, 'A')) bits.push(t('roll.surpriseAttack'));
  if (berserk(A, 'A')) bits.push(t('skill.berserk'));
  const [au, aw, ru, rw] = [shortUnit(A.resolved.unit), weaponShort(A.resolved.weapon, t), shortUnit(B.resolved.unit), weaponShort(B.resolved.weapon, t)];
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
export function matchupShareCard(view, h, t = tEn) {
  const side = (role, key) => {
    const x = view[role];
    const situation = [inFoxhole(x) && t('skill.foxhole'), inCover(x) && t('roll.cover'), firewall(x, t), ...ownChips(x, t), fireteam(x, t), allies(x, view[role === 'A' ? 'B' : 'A'], t),
      surprise(x, role) && t('roll.surpriseAttack'), berserk(x, role) && t('skill.berserk'), ...teamOps(x)];
    return {
      n: h.text[key], l: h.label[key],
      u: shortUnit(x.resolved.unit), w: weaponShort(x.resolved.weapon, t), s: situation.filter(Boolean).join(', '),
      c: x.crest ?? '',
    };
  };
  return {k: h.kind, nf: h.fallback, x: [rangeText(view, t), ...zoneNames(view, t)].filter(Boolean).join(' · '), a: side('A', 'active'), b: side('B', 'reactive')};
}

const classicDice = (p, side, t) => {
  const sd = p[`bonusBurst${side}`];
  return `${t('abbr.B')}${p[`burst${side}`]}${sd ? `+${sd}` : ''} ${t('abbr.SV')}${p[`successValue${side}`]} ${t('abbr.PS')}${p[`damage${side}`]}`;
};

export function classicRollSummary(params, s, t = tEn) {
  return {
    a: t('side.active'),
    r: t('side.reactive'),
    ad: classicDice(params, 'A', t),
    rd: classicDice(params, 'B', t),
    setup: [params.ammoA, params.ammoB].map((a) => (classicAmmoKey(a) ? t(classicAmmoKey(a)) : a)).join(` ${t('roll.vs')} `),
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
