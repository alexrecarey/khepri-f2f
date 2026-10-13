// Unit crests: army.json names each one by a slug (unit.crest, or a
// profile's own crest where it differs), Corvus Belli's file name. The SVGs
// live in R2, put there by scripts/crests/sync.mjs (yarn crests).
import {unitById} from './lookup.js';

// The crest for a trooper: its profile's own, else its unit's.
export const crestOf = (unit, profile) => profile?.crest ?? unit?.crest ?? null;

// The crest for a search row ({unitId, groupId, profileId}): profile ids
// repeat across a unit's groups (a TAG and its pilot are both profile 1), so
// the group picks the profile. Groups are the same in every faction.
export function crestForRow(army, row) {
  const unit = unitById(army, row?.unitId);
  if (!unit) return null;
  const groups = Object.values(unit.byFaction)[0]?.groups ?? [];
  const profile = groups.find((g) => g.id === row.groupId)?.profiles.find((p) => p.id === row.profileId);
  return crestOf(unit, profile);
}

// Every slug the data names.
export function crestSlugs(army) {
  const out = new Set();
  for (const unit of army.units) {
    if (unit.crest) out.add(unit.crest);
    for (const f of Object.values(unit.byFaction)) {
      for (const g of f.groups) for (const p of g.profiles) if (p.crest) out.add(p.crest);
    }
  }
  return out;
}
