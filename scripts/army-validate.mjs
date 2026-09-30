// Checks a freshly built army.json against what the calculator understands.
// Returns a list of problems; fetch-army.mjs refuses to write the file if
// there are any. When a new Army release trips one of these, either teach the
// rules about the new value or add it to the matching KNOWN_* list below with
// a note on why it doesn't matter.

import {EXPECTED_NAMES, SKILL, EQUIP} from '../src/army/ids.js';
import {isBsAttackWeapon, unreadWeaponExtras} from '../src/army/weapons.js';
import {MODELED_IMMUNITIES, STATE_IMMUNITIES} from '../src/rules/matchup.js';

// Ammunition names. The rules read AP, T2, Shock (and N); the default-weapon
// ranking reads the rest by name (rules/defaultWeapon.js).
const KNOWN_AMMO = ['N', 'AP', 'DA', 'Exp', 'T2', 'Shock', 'E/M', 'PARA', 'Stun', 'Eclipse', 'Smoke'];

// Weapon properties. Read by army/weapons.js: templates, BS Weapon (PH/WIP),
// Bioweapon, Continuous Damage, Non-lethal, State: Stunned, and the ones that
// make a weapon not a BS Attack (CC, Deployable, Perimeter, Comms. Attack,
// Technical Weapon, Targetless). The others don't change a single BS Attack.
const KNOWN_PROPS = [
  'Direct Template (Small Teardrop)', 'Direct Template (Large Teardrop)', 'Impact Template (Circular)',
  'BS Weapon (PH)', 'BS Weapon (WIP)', 'Bioweapon (DA+SHOCK)', 'Continuous Damage', 'Non-lethal',
  'State: Stunned', 'State: Stunned / Immbolized-B',
  'CC', 'CC Attack (+3)', 'Deployable', 'Perimeter', 'Comms. Attack', 'Technical Weapon', 'Targetless',
  // Not modelled (a single BS Attack plays the same):
  'Suppressive Fire', 'Anti-materiel', 'Intuitive Attack', 'Speculative Attack', 'Disposable (1)', 'Disposable (2)',
  'Disposable (3)', 'Non-Reloadable', 'Concealed', 'State: IMM-A', 'State: Dead', 'State: Sepsitorized',
  'State: Isolated', 'No LoF', 'Zone of Control', 'Reflective', 'Double Shot', 'Silent (-6)', 'Boost',
  'Burst: Single Target', 'Target (VITA)', 'Improvised', 'Throwing Weapon', 'Indiscriminate',
  '[*]', '[**]', '[***]',
];

// Bracketed values of the skills and equipment the rules read. `read` is what
// the rules parse; `known` is seen in the data but not modelled yet.
const TRAIT_EXTRAS = [
  // +1" etc. is extra movement: read, and correctly nothing to roll.
  {kind: 'skill', id: SKILL.DODGE, name: 'Dodge', read: /^(PH=\d+|[+-]\d+|\+\d+SD|ARM \+\d+|\+\d+")$/, known: []},
  {kind: 'skill', id: SKILL.MIMETISM, name: 'Mimetism', read: /^-\d+$/, known: []},
  {kind: 'skill', id: SKILL.SURPRISE_ATTACK, name: 'Surprise Attack', read: /^-\d+$/, known: []},
  {kind: 'equip', id: EQUIP.ALBEDO, name: 'Albedo', read: /^-\d+$/, known: []},
  {kind: 'skill', id: SKILL.BS_ATTACK, name: 'BS Attack', read: /^(\+\d+(B|SD)|AP|T2|SR-\d+|Continuous Damage|-\d+)$/,
    known: ['Shock', 'Guided']},
  {kind: 'skill', id: SKILL.IMMUNITY, name: 'Immunity',
    read: new RegExp(`^(${[...MODELED_IMMUNITIES, ...STATE_IMMUNITIES].join('|')})$`), known: []},
];

// Every place a trait or weapon ref appears: profiles, loadouts, upgrades.
function* holders(army) {
  for (const u of army.units) {
    for (const [fid, {groups}] of Object.entries(u.byFaction)) {
      for (const g of groups) {
        for (const p of g.profiles) yield {where: `${u.isc} (${fid})`, ...p};
        for (const o of g.options) yield {where: `${u.isc} (${fid}) ${o.name}`, ...o};
      }
    }
    for (const it of [...(u.upgrades?.chart ?? []), ...(u.upgrades?.ball ?? [])]) {
      const of = (type) => it.attrs.filter((a) => a.type === type);
      yield {where: `${u.isc} upgrade ${it.label}`, skills: of('skill'), equip: of('equip'), weapons: of('weapon')};
    }
  }
}

export function validateArmy(army) {
  const problems = new Set();
  const once = (msg) => problems.add(msg);

  // Ids the rules use still name the same skill / equipment.
  const seen = {skill: new Map(), equip: new Map()};
  for (const h of holders(army)) {
    for (const s of h.skills ?? []) seen.skill.set(s.id, s.name);
    for (const e of h.equip ?? []) seen.equip.set(e.id, e.name);
  }
  for (const kind of ['skill', 'equip']) {
    for (const [id, name] of EXPECTED_NAMES[kind]) {
      if (!seen[kind].has(id)) once(`${kind} id ${id} ("${name}", src/army/ids.js) is on no trooper any more`);
      else if (seen[kind].get(id) !== name) once(`${kind} id ${id} is now "${seen[kind].get(id)}", src/army/ids.js expects "${name}"`);
    }
  }

  // Weapon rows.
  for (const [id, rows] of Object.entries(army.weapons)) {
    for (const r of rows) {
      for (const a of r.ammo ?? []) if (!KNOWN_AMMO.includes(a)) once(`ammunition "${a}" (${r.name}, weapon ${id})`);
      for (const p of r.props) if (!KNOWN_PROPS.includes(p)) once(`weapon property "${p}" (${r.name}, weapon ${id})`);
    }
  }

  for (const h of holders(army)) {
    // Loadout extras on weapons that can make a BS Attack must all be read.
    for (const w of h.weapons ?? []) {
      if (!(army.weapons[w.id] ?? []).some(isBsAttackWeapon)) continue;
      for (const e of unreadWeaponExtras(w.extra)) once(`weapon extra "${e}" on ${w.name} (${h.where})`);
    }
    // Bracketed values of the traits the rules read.
    for (const t of TRAIT_EXTRAS) {
      for (const x of (t.kind === 'skill' ? h.skills : h.equip) ?? []) {
        if (x.id !== t.id) continue;
        for (const e of x.extra ?? []) {
          if (!t.read.test(e) && !t.known.includes(e)) once(`${t.name} (${e}) (${h.where})`);
        }
      }
    }
  }
  return [...problems];
}
