// The weapon picked once a loadout is chosen.
import {bioweaponProp, isImpactTemplate, isPlasma} from '../army/weapons.js';
import {RANGE_BANDS} from './ranges.js';

// Ammo precedence for the default weapon, best first. Plasma rows list N ammo
// with an ARM and BTS save, and Viral weapons N ammo with Bioweapon (DA+SHOCK).
// Combined ammo (AP+Exp) ranks as its best part. Loadout ammo extras (T2,
// Viral, Shock) are already in the row (withAmmoExtra).
const AMMO_PRECEDENCE = ['PLASMA', 'EXP', 'DA', 'VIRAL', 'T2', 'AP', 'SHOCK', 'N', 'E/M', 'STUN'];
function ammoRank({row, mods}) {
  const types = (row.ammo ?? ['N']).map((a) => a.toUpperCase());
  if (isPlasma(row)) types.push('PLASMA');
  if (bioweaponProp(row)) types.push('VIRAL');
  if (mods.forceAP) types.push('AP');
  const ranks = types.map((t) => AMMO_PRECEDENCE.indexOf(t)).filter((i) => i !== -1);
  return ranks.length > 0 ? Math.min(...ranks) : AMMO_PRECEDENCE.length;
}

const impactTemplate = ({row}) => isImpactTemplate(row);

// Far edge (cm) of the band with the weapon's best range MOD, the farthest one
// if several tie. Direct Templates reach about the first band (0-8").
function bestRangeBand({row}) {
  if (!row.ranges?.length) return RANGE_BANDS[0].to;
  const best = Math.max(...row.ranges.map((b) => b.mod));
  return Math.max(...row.ranges.filter((b) => b.mod === best).map((b) => b.to));
}

// Sort keys per role, lower wins, ties keep menu order. Neither depends on the
// shared range, so changing it never swaps the weapon. Active: highest burst,
// then Impact Template (Circular), then ammo. Reactive: a +SD weapon, then the
// farthest best range band, then Impact Template (Circular), then ammo.
const DEFAULT_WEAPON_KEYS = {
  active: (w) => [-((w.row.burst ?? 1) + w.mods.burst), impactTemplate(w) ? 0 : 1, ammoRank(w)],
  reactive: (w) => [w.mods.sd > 0 ? 0 : 1, -bestRangeBand(w), impactTemplate(w) ? 0 : 1, ammoRank(w)],
};

// Weapon picked once a loadout is chosen, from bsWeapons(); null if none.
export function defaultWeapon(weapons, role) {
  const key = DEFAULT_WEAPON_KEYS[role];
  const compare = (a, b) => {
    const kb = key(b);
    return key(a).reduce((d, x, i) => d || x - kb[i], 0);
  };
  return [...weapons].sort(compare)[0] ?? null;
}
