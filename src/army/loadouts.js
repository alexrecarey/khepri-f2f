// A trooper's profile as modified by the chosen loadout and upgrades.

// Some loadouts replace a stat, listed as an option skill like "BS=12"
// (Konduktor FTO, Polaris Bearpode Beta) or "BTS=3" (Alguacil Gatta).
const STAT_FIELDS = {MOV: 'move', CC: 'cc', BS: 'bs', PH: 'ph', WIP: 'wip', ARM: 'arm', BTS: 'bts', W: 'w', STR: 'str', S: 's'};
export function applyStatOverrides(profile, option) {
  let out = profile;
  for (const s of option?.skills ?? []) {
    const m = /^([A-Z]+)=(\d+)$/.exec(s.name ?? '');
    const field = m && STAT_FIELDS[m[1]];
    if (field) out = {...out, [field]: Number(m[2])};
  }
  return out;
}

// Team-Ops upgrades (unit.upgrades, from the Army "spectables"): one optional
// pick from the Team-Ops chart and one optional TacBall item. Each item adds
// stat deltas and/or skills, equipment and weapons. MOV changes are skipped:
// the calculator doesn't use MOV. Spec-Ops charts are not applied yet.
export function pickedUpgrades(unit, sel) {
  const u = unit?.upgrades;
  if (!u) return [];
  return [u.chart?.[sel?.upgrade], u.ball?.[sel?.ball]].filter(Boolean);
}

export function applyUpgrades(profile, option, items) {
  let p = {...profile, skills: [...(profile.skills ?? [])], equip: [...(profile.equip ?? [])]};
  const weapons = [];
  for (const item of items) {
    for (const a of item.attrs ?? []) {
      const ref = {id: a.id, name: a.name, ...(a.extra ? {extra: a.extra} : {})};
      if (a.type === 'stat' && !a.stat.startsWith('move')) p = {...p, [a.stat]: (p[a.stat] ?? 0) + a.q};
      else if (a.type === 'skill') p.skills.push(ref);
      else if (a.type === 'equip') p.equip.push(ref);
      else if (a.type === 'weapon') weapons.push(ref);
    }
  }
  const opt = option && weapons.length > 0 ? {...option, weapons: [...(option.weapons ?? []), ...weapons]} : option;
  return {profile: p, option: opt};
}
