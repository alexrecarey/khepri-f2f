// Saved rolls (lists.saved): the setup to load back, plus a summary for the
// Saved rolls list, so the list shows odds without running the engine again.
//   {id, mode, savedAt, setup, summary: {a, r, ad, rd, setup, ap, rp}}
//   a / r     who rolls: "Squalos · HMG" (Matchup) or "Active" (Classic)
//   ad / rd   dice lines: "B4 SV15 PS7"
//   setup     the situation: '24-32" · cover · FT5'
//   ap / rp   chance each side wins (or, not face to face, causes a wound)
import {RANGE_BANDS} from '../rules/ranges.js';
import {shortWeaponName} from '../ui/names.js';
import {MODES} from '../ui/modes.js';

const pct0 = (p) => `${Math.round(100 * p)}%`;
const shortUnit = (unit) => unit.isc.split(',')[0].trim();

// The roll's identity: two rolls with the same setup are the same roll.
export const setupKey = (mode, setup) => JSON.stringify([mode, setup]);

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
  if (w.pseudo) return w.pseudo === 'dodge' ? 'Dodge' : 'No ARO';
  return shortWeaponName(w.name);
}

// view: matchupView(); s: results.js summarize()
export function matchupRollSummary(view, s) {
  const {A, B} = view;
  const band = RANGE_BANDS.find((b) => b.to === view.rangeCm) ?? null;
  const bits = [band?.label];
  if (A.sel.inCover || B.sel.inCover) bits.push('cover');
  for (const x of [A, B]) if (x.sel.ftSize > 1) bits.push(`FT${x.sel.ftSize}`);
  if (A.sel.surpriseAttack) bits.push('surprise');
  return {
    a: `${shortUnit(A.resolved.unit)} · ${weaponShort(A.resolved.weapon)}`,
    r: `${shortUnit(B.resolved.unit)} · ${weaponShort(B.resolved.weapon)}`,
    ad: view.ledger?.ledger.A?.dice ?? '',
    rd: view.ledger?.ledger.B?.dice ?? '',
    setup: bits.filter(Boolean).join(' · '),
    ...chances(s),
  };
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

export function makeRoll({mode, setup, summary, now = Date.now()}) {
  return {id: `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, mode, savedAt: now, setup, summary};
}
