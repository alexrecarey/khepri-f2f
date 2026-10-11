// Unit crests: army.json names each one by a slug (unit.crest, or a
// profile's own crest where it differs), Corvus Belli's file name. The SVGs
// live in R2, put there by scripts/crests/sync.mjs (yarn crests).

// The crest for a trooper: its profile's own, else its unit's.
export const crestOf = (unit, profile) => profile?.crest ?? unit?.crest ?? null;

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
