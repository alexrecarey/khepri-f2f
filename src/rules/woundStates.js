// The states a trooper goes through as it takes wounds, mildest first: what
// the results list and bar show for each side's target.
//
// VITA or STR n: wounds 1 ... n-1, then Unconscious, then Dead. NWI and
// Dogged rename the Unconscious step (those troopers keep fighting). Remote
// Presence adds a second Unconscious before Dead. Shock against VITA 1 skips
// straight to Dead (shockApplies decides; the engine result then counts the
// failed save as one extra wound).
//
// Each state: {key, label, wounds, glyph, outOfFight, shock?}. `wounds` is how
// many wounds reach it; the last state (Dead) covers that many or more.
// outOfFight: the state takes the trooper out of the fight (the first
// Unconscious and Dead), so the results offer its chance over several orders.
import {SKILL} from '../army/ids.js';
import {hasSkill} from '../army/traits.js';

const plural = (n) => `${n} wound${n === 1 ? '' : 's'}`;

export function woundStates(profile, traits, {shock = false} = {}) {
  if (shock) return [{key: 'dead', label: 'Dead', wounds: 1, glyph: 'dead', outOfFight: true, shock: true}];
  const n = Math.max(1, profile?.w ?? 1);
  const states = [];
  for (let w = 1; w < n; w++) states.push({key: `w${w}`, label: plural(w), wounds: w, glyph: null, outOfFight: false});
  const nwi = hasSkill(traits, SKILL.NWI);
  const dogged = !nwi && hasSkill(traits, SKILL.DOGGED);
  const down = nwi ? {key: 'nwi', label: 'NWI', glyph: 'nwi'} : dogged ? {key: 'dogged', label: 'Dogged', glyph: 'dogged'}
    : {key: 'unc', label: 'Unconscious', glyph: 'unc'};
  states.push({...down, wounds: n, outOfFight: down.key === 'unc'});
  let next = n + 1;
  if (hasSkill(traits, SKILL.REMOTE_PRESENCE)) {
    // No glyph for the second step: its deeper shade already says it.
    states.push({key: `${down.key}2`, label: `${down.label} ×2`, wounds: next, glyph: null, outOfFight: false});
    next += 1;
  }
  states.push({key: 'dead', label: 'Dead', wounds: next, glyph: 'dead', outOfFight: true});
  return states;
}
