// A trooper's profile as modified by the chosen loadout and upgrades.

// Some loadouts replace a stat (Konduktor FTO: BS=12, Alguacil Gatta: BTS=3);
// the pipeline stores those as option.statOverrides.
/**
 * @param {import('../types.js').ProfileRow} profile
 * @param {import('../types.js').OptionRow | null | undefined} option
 * @returns {import('../types.js').ProfileRow}
 */
export function applyStatOverrides(profile, option) {
  return option?.statOverrides ? {...profile, ...option.statOverrides} : profile;
}

// Team-Ops upgrades (unit.upgrades, from the Army "spectables"): one optional
// pick from the Team-Ops chart and one optional TacBall item. Each item adds
// stat deltas and/or skills, equipment and weapons. MOV changes are skipped:
// the calculator doesn't use MOV. Spec-Ops charts are not applied yet.
/**
 * @param {import('../types.js').UnitRow | null | undefined} unit
 * @param {Partial<Pick<import('../types.js').Selection, 'upgrade' | 'ball'>> | null | undefined} sel
 * @returns {import('../types.js').UpgradeItem[]}
 */
export function pickedUpgrades(unit, sel) {
  const u = unit?.upgrades;
  if (!u) return [];
  // A null index reads nothing, like one past the end; Boolean keeps the items.
  return /** @type {import('../types.js').UpgradeItem[]} */ ([u.chart?.[/** @type {number} */ (sel?.upgrade)], u.ball?.[/** @type {number} */ (sel?.ball)]].filter(Boolean));
}

/**
 * @param {import('../types.js').ProfileRow} profile
 * @param {import('../types.js').OptionRow | null} option
 * @param {import('../types.js').UpgradeItem[]} items
 */
export function applyUpgrades(profile, option, items) {
  let p = {...profile, skills: [...(profile.skills ?? [])], equip: [...(profile.equip ?? [])]};
  /** @type {import('../types.js').TraitRef[]} */
  const weapons = [];
  for (const item of items) {
    for (const a of item.attrs ?? []) {
      // A stat attr has no id or name; its ref is built and never pushed.
      const ref = {id: /** @type {number} */ (a.id), name: /** @type {string} */ (a.name), ...(a.extra ? {extra: a.extra} : {})};
      // `stat` names a ProfileRow Attribute once the MOV ones are skipped.
      if (a.type === 'stat' && !a.stat.startsWith('move')) p = {...p, [a.stat]: (p[/** @type {import('../types.js').StatKey} */ (a.stat)] ?? 0) + a.q};
      else if (a.type === 'skill') p.skills.push(ref);
      else if (a.type === 'equip') p.equip.push(ref);
      else if (a.type === 'weapon') weapons.push(ref);
    }
  }
  const opt = option && weapons.length > 0 ? {...option, weapons: [...(option.weapons ?? []), ...weapons]} : option;
  return {profile: p, option: opt};
}

// The picked upgrade that raises `stat` ('bs', 'arm'...), for the ledger to
// say why the Attribute is higher than the profile's; null if none.
/**
 * @param {import('../types.js').UpgradeItem[] | null | undefined} upgrades
 * @param {string} stat
 * @returns {import('../types.js').UpgradeItem | null}
 */
export const upgradeRaising = (upgrades, stat) =>
  (upgrades ?? []).find((u) => u.attrs?.some((a) => a.type === 'stat' && a.stat === stat)) ?? null;
