// Pure helpers that turn Army unit profiles + weapons into calculator inputs.
// No React here so the rules can be unit-tested with `node --test`.

export const SKILL = {
  MIMETISM: 28,
  DODGE: 40,
  TOTAL_REACTION: 61,
  SIXTH_SENSE: 67,
  SAPPER: 89,
  NEUROCINETICS: 109,
  MARKSMANSHIP: 156,
  IMMUNITY: 162,
  SURPRISE_ATTACK: 191,
  VULNERABILITY: 220,
  NO_COVER: 264,
  LIMITED_COVER: 268,
  BS_ATTACK: 201,
  TEAM_OPS: 282,
  SPEC_OPS: 281,
};

export const EQUIP = {
  NANOSCREEN: 108,
  MSV1: 114,
  MSV2: 115,
  MSV3: 116,
  X_VISOR: 117,
  ALBEDO: 183,
};

// Shared distance between the two units. `to` is the upper bound in cm, which
// matches the cumulative band limits in the Army weapon table.
// Same columns as the N5 weapon chart: 8" | 16" | 24" | 32" | 40" | 48" | 96".
export const RANGE_BANDS = [
  {to: 20, inches: 8, label: '0-8"'},
  {to: 40, inches: 16, label: '8-16"'},
  {to: 60, inches: 24, label: '16-24"'},
  {to: 80, inches: 32, label: '24-32"'},
  {to: 100, inches: 40, label: '32-40"'},
  {to: 120, inches: 48, label: '40-48"'},
  {to: 240, inches: 96, label: '48-96"'},
];

// Same limits as src/inputs/validateParams.js
const LIMITS = {
  burst: [0, 6],
  bonusBurst: [0, 3],
  successValue: [1, 30],
  damage: [0, 30],
  arm: [0, 13],
  bts: [0, 12],
};
const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

const BS_SAVINGS = new Set(['ARM', 'ARM/2', 'BTS', 'BTS/2', 'ARM=0', 'ARM and BTS']);
const EXCLUDED_PROPS = new Set(['CC', 'CC Attack (+3)', 'Deployable', 'Perimeter', 'Comms. Attack', 'Technical Weapon', 'Targetless']);

export function effectiveTraits(profile, option) {
  return {
    skills: [...(profile?.skills ?? []), ...(option?.skills ?? [])],
    equip: [...(profile?.equip ?? []), ...(option?.equip ?? [])],
  };
}

const hasSkill = (traits, id, extra) =>
  (traits?.skills ?? []).some((s) => s.id === id && (extra === undefined || (s.extra ?? []).includes(extra)));
const hasEquip = (traits, id) => (traits?.equip ?? []).some((e) => e.id === id);
const skillExtra = (traits, id) => (traits?.skills ?? []).find((s) => s.id === id)?.extra?.[0] ?? null;

export const isTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Direct Template'));

export const isImpactTemplate = (row) => (row?.props ?? []).some((p) => p.startsWith('Impact Template'));

// Direct and Impact (Blast mode) templates ignore cover's +3 to the Saving
// Roll. The -3 BS MOD still applies to the attack roll.
export const ignoresCoverOnSaves = (row) => isTemplate(row) || isImpactTemplate(row);

// Units with the No Cover skill (TAGs, bikes, Redeye...) get nothing from cover.
export const benefitsFromCover = (side) => Boolean(side?.inCover) && !hasSkill(side?.traits, SKILL.NO_COVER);

// Nanoscreen (wiki): -3 BS MOD on BS Attack Rolls against the user and +3 to
// the user's Saving Rolls against BS Attacks, templates included. Treated as
// the same MOD as cover, so the two do not stack.
export const hasNanoscreen = (side) => hasEquip(side?.traits, EQUIP.NANOSCREEN);

export function isBsAttackWeapon(row) {
  if (!row || typeof row.dmg !== 'number') return false;
  if (!BS_SAVINGS.has(row.saving)) return false;
  if ((row.props ?? []).some((p) => EXCLUDED_PROPS.has(p))) return false;
  return Boolean(row.ranges) || isTemplate(row);
}

// Loadout-level weapon extras such as "+1B", "+1SD", "PS=6", "AP".
export function parseWeaponMods(extra = []) {
  const mods = {burst: 0, sd: 0, ps: null, forceAP: false, cont: false, sv: 0};
  for (const e of extra ?? []) {
    let m;
    if ((m = /^\+(\d+)B$/.exec(e))) mods.burst += Number(m[1]);
    else if ((m = /^\+(\d+)SD$/.exec(e))) mods.sd += Number(m[1]);
    else if ((m = /^PS=(\d+)$/.exec(e))) mods.ps = Number(m[1]);
    else if (e === 'AP') mods.forceAP = true;
    else if (e === 'Continous Damage') mods.cont = true;
    else if ((m = /^([+-]\d+)$/.exec(e))) mods.sv += Number(m[1]);
  }
  return mods;
}

const modeSuffix = (mode) => (mode ? ` (${mode.replace(/ Mode$/i, '')})` : '');

export function weaponLabel(row, mods) {
  // Templates show their burst too (e.g. a Dog-Warrior's B2 Chain Rifle); the
  // weapon menu marks them "template" in place of the range MOD.
  const burst = (row.burst ?? 1) + mods.burst;
  const sd = mods.sd > 0 ? `+${mods.sd}SD` : '';
  const dmg = mods.ps ?? row.dmg;
  return `${row.name}${modeSuffix(row.mode)} · B${burst}${sd} · PS${dmg} · ${row.ammo ?? 'N'}`;
}

// Single-mode first, then "Hit Mode", so the default pick is the plain shot.
const modeRank = (row) => (!row.mode ? 0 : /^hit/i.test(row.mode) ? 1 : 2);

// BS-attack capable weapons of a loadout, one entry per firing mode.
export function bsWeapons(option, weapons) {
  const out = [];
  for (const w of option?.weapons ?? []) {
    const mods = parseWeaponMods(w.extra);
    const rows = [...(weapons?.[w.id] ?? [])].sort((a, b) => modeRank(a) - modeRank(b));
    for (const row of rows) {
      if (!isBsAttackWeapon(row)) continue;
      const key = `${w.id}:${row.mode ?? ''}`;
      if (out.some((x) => x.key === key)) continue;
      out.push({key, id: w.id, name: row.name, mode: row.mode, row, mods, label: weaponLabel(row, mods)});
    }
  }
  return out;
}

// Fireteam bonuses by member count (N5, cumulative, assuming all members are
// the same Unit): 2 = BS Attack +1 SD, 3 = +3 Discover and +1 Dodge MOD,
// 4 = +1 BS, 5 = Sixth Sense. 0 means not in a Fireteam.
export const FIRETEAM_MIN = 2;
export const FIRETEAM_MAX = 5;
export function fireteamBonuses(size = 0) {
  return {
    sd: size >= 2 ? 1 : 0,
    dodge: size >= 3 ? 1 : 0,
    bs: size >= 4 ? 1 : 0,
    sixthSense: size >= 5,
  };
}

export function dodgeSuccessValue(profile, traits, mod = 0) {
  let sv = profile?.ph ?? 0;
  const extra = skillExtra(traits, SKILL.DODGE);
  let m;
  if (extra && (m = /^PH=(\d+)$/.exec(extra))) sv = Number(m[1]);
  else if (extra && (m = /^([+-]\d+)$/.exec(extra))) sv += Number(m[1]);
  return clamp(LIMITS.successValue, sv + mod);
}

// Reactive-only choices that are not weapons.
// Dodge is valid for both sides; "No ARO" only makes sense for the reactive one.
export function pseudoWeapons(profile, traits, side = 'B', dodgeMod = 0) {
  const list = [{key: 'dodge', pseudo: 'dodge', label: `Dodge (PH ${dodgeSuccessValue(profile, traits, dodgeMod)})`}];
  if (side === 'B') list.push({key: 'none', pseudo: 'none', label: 'No ARO (unopposed)'});
  return list;
}

// BS MOD of a weapon at the chosen distance; null when out of range.
// X Visor (shooter's traits) turns a -3 Range MOD into 0 and a -6 into -3.
export function rangeModFor(row, distanceCm, traits) {
  if (isTemplate(row)) return 0;
  if (!row?.ranges) return null;
  const band = row.ranges.find((b) => distanceCm <= b.to);
  if (!band) return null;
  if (band.mod < 0 && hasEquip(traits, EQUIP.X_VISOR)) return Math.min(0, band.mod + 3);
  return band.mod;
}

// Extras such as "+1B" tell otherwise identical loadouts apart.
const nameWithExtras = (x) => (x.extra?.length ? `${x.name} (${x.extra.join(', ')})` : x.name);

function bsWeaponNames(option, weapons) {
  const names = [];
  for (const w of option?.weapons ?? []) {
    const name = nameWithExtras(w);
    if ((weapons?.[w.id] ?? []).some(isBsAttackWeapon) && !names.includes(name)) names.push(name);
  }
  return names;
}

// Distinguishable labels for the loadout rows of a profile group (the Army
// app lists e.g. six identically named "HATAMOTO" rows).
// Loadouts that only differ in points, SWC, order or non-BS gear play the same
// here; keep the first of each.
const traitKey = (t) => `${t.id}:${(t.extra ?? []).join(',')}`;
const loadoutFingerprint = (o, weapons) => JSON.stringify([
  o.name,
  (o.weapons ?? []).filter((w) => (weapons?.[w.id] ?? []).some(isBsAttackWeapon)).map(traitKey).sort(),
  (o.skills ?? []).map(traitKey).sort(),
  (o.equip ?? []).map(traitKey).sort(),
]);

// Lowest value over the loadouts collapsed into a row, with a "+" when some cost more.
function lowestCost(values) {
  const distinct = [...new Set(values)].sort((a, b) => Number(a) - Number(b));
  return `${distinct[0]}${distinct.length > 1 ? '+' : ''}`;
}

// Short forms players use for skills and equipment, to keep the labels short.
// Hand-kept; names not listed are shown as in the Army data.
const ABBREVIATIONS = {
  'Chain of Command': 'CoC',
  'EVO Hacking Device': 'EVO HD',
  'Forward Observer': 'FO',
  'Hacking Device': 'HD',
  'Hacking Device Plus': 'HD+',
  'Killer Hacking Device': 'KHD',
  Lieutenant: 'Lt',
  'Multispectral Visor L1': 'MSV1',
  'Multispectral Visor L2': 'MSV2',
  'Multispectral Visor L3': 'MSV3',
};
const shortNameWithExtras = (x) => nameWithExtras({...x, name: ABBREVIATIONS[x.name] ?? x.name});

// Weapons the label leaves out: the BS weapons every loadout has and the ones
// that aren't BS weapons. Collapsed loadouts can differ in the latter, listed
// as alternatives ("optional" when some have none).
function omittedWeapons(row, shown) {
  const perLoadout = row.map((o) =>
    [...new Set((o.weapons ?? []).map(nameWithExtras))].filter((n) => !shown.includes(n)));
  const common = perLoadout[0].filter((n) => perLoadout.every((names) => names.includes(n)));
  const others = [...new Set(perLoadout.map((names) => names.filter((n) => !common.includes(n)).join(', ')))];
  const alternatives = others.filter(Boolean);
  const parts = [];
  if (common.length > 0) parts.push(common.join(', '));
  if (alternatives.length > 0) parts.push(`${others.includes('') ? 'optional ' : ''}${alternatives.join(' or ')}`);
  return parts.join(' · ');
}

// Per row: `label` tells the loadouts apart, skills and equipment (abbreviated)
// first as in the Army list's name column; `swc` and `points` mark the row as
// a profile, not a weapon; `detail` is the rest of the loadout ('' when the
// label has it all).
export function loadoutLabels(group, weapons) {
  const collapsed = new Map();
  for (const o of group?.options ?? []) {
    const fp = loadoutFingerprint(o, weapons);
    collapsed.set(fp, [...(collapsed.get(fp) ?? []), o]);
  }
  const rows = [...collapsed.values()];
  const options = rows.map((row) => row[0]);
  const namesDiffer = new Set(options.map((o) => o.name)).size > 1;
  const perOption = options.map((o) => bsWeaponNames(o, weapons));
  const labels = options.map((o, i) => {
    const mine = perOption[i];
    const common = mine.filter((n) => perOption.every((names) => names.includes(n)));
    let shown = mine.filter((n) => !common.includes(n));
    if (shown.length === 0) shown = mine;
    const extras = [...(o.skills ?? []), ...(o.equip ?? [])].map(shortNameWithExtras);
    const parts = [];
    if (namesDiffer && o.name) parts.push(o.name);
    if (extras.length > 0) parts.push(extras.join(', '));
    if (shown.length > 0) parts.push(shown.join(', '));
    return {
      id: o.id,
      label: parts.join(' · ') || o.name || `Profile ${o.id}`,
      swc: lowestCost(rows[i].map((x) => x.swc)),
      points: lowestCost(rows[i].map((x) => x.points)),
      detail: omittedWeapons(rows[i], shown),
    };
  });
  const counts = labels.reduce((acc, l) => acc.set(l.label, (acc.get(l.label) ?? 0) + 1), new Map());
  return labels.map((l) => (counts.get(l.label) > 1 ? {...l, label: `${l.label} #${l.id}`} : l));
}

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

// Resolves a picker selection (ids) against the army data. The returned
// profile has the loadout's stat overrides and any Team-Ops upgrades applied;
// the returned option includes upgrade weapons.
export function resolveSelection(army, sel) {
  if (!army || !sel?.unitId) return null;
  const unit = army.units.find((u) => u.id === sel.unitId);
  if (!unit) return null;
  const factionId = sel.factionId ?? (unit.inFactions.length === 1 ? unit.inFactions[0] : null);
  const groups = factionId ? unit.byFaction[factionId]?.groups ?? null : null;
  const group = groups?.find((g) => g.id === sel.groupId) ?? (groups?.length === 1 ? groups[0] : null);
  const baseProfile = group?.profiles.find((p) => p.id === sel.profileId) ?? (group?.profiles.length === 1 ? group.profiles[0] : null);
  const baseOption = group?.options.find((o) => o.id === sel.optionId) ?? null;
  let profile = baseProfile ? applyStatOverrides(baseProfile, baseOption) : null;
  let option = baseOption;
  const teamOps = Boolean(profile) && hasSkill(effectiveTraits(profile, baseOption), SKILL.TEAM_OPS);
  const upgrades = teamOps ? pickedUpgrades(unit, sel) : [];
  if (upgrades.length > 0) ({profile, option} = applyUpgrades(profile, baseOption, upgrades));
  // Upgrade weapons the calculator can't roll (e.g. mines), for a warning.
  const unsupportedUpgradeWeapons = upgrades
    .flatMap((u) => u.attrs.filter((x) => x.type === 'weapon'))
    .filter((w) => !(army.weapons[w.id] ?? []).some(isBsAttackWeapon))
    .map((w) => w.name);
  const traits = profile ? effectiveTraits(profile, option) : null;
  let weapon = null;
  if (option && profile && sel.weaponKey) {
    weapon = bsWeapons(option, army.weapons).find((w) => w.key === sel.weaponKey)
      ?? pseudoWeapons(profile, traits, 'B').find((w) => w.key === sel.weaponKey)
      ?? null;
  }
  return {
    unit, factionId, groups, group, profile, option, traits, weapon,
    upgrades, unsupportedUpgradeWeapons,
    inCover: Boolean(sel.inCover),
    ftSize: sel.ftSize ?? 1,
  };
}

const equipExtra = (traits, id) => (traits?.equip ?? []).find((e) => e.id === id)?.extra?.[0] ?? null;
const hasMsv = (traits) => hasEquip(traits, EQUIP.MSV1) || hasEquip(traits, EQUIP.MSV2) || hasEquip(traits, EQUIP.MSV3);

// Albedo (wiki): an enemy with a Multispectral Visor or Marksmanship who
// declares a BS Attack requiring LoF against the bearer applies the bracketed
// MOD (-3 / -6). Not applied to CC. Other attackers are unaffected.
function albedoMod(targetTraits, attackerTraits) {
  if (!hasEquip(targetTraits, EQUIP.ALBEDO)) return 0;
  if (!hasMsv(attackerTraits) && !hasSkill(attackerTraits, SKILL.MARKSMANSHIP)) return 0;
  const mod = Number(equipExtra(targetTraits, EQUIP.ALBEDO));
  return Number.isFinite(mod) && mod < 0 ? mod : -3;
}

function mimetismMod(targetTraits, attackerTraits) {
  const extra = skillExtra(targetTraits, SKILL.MIMETISM);
  if (!hasSkill(targetTraits, SKILL.MIMETISM)) return 0;
  const mod = Number(extra);
  const value = Number.isFinite(mod) && mod < 0 ? mod : -3;
  if (hasEquip(attackerTraits, EQUIP.MSV2) || hasEquip(attackerTraits, EQUIP.MSV3)) return 0;
  if (hasEquip(attackerTraits, EQUIP.MSV1) && value === -3) return 0;
  return value;
}

// Viral etc. are listed as one BTS save plus a "Bioweapon (DA+SHOCK)" property.
const bioweaponAmmo = (row) => {
  const prop = (row.props ?? []).find((p) => p.startsWith('Bioweapon ('));
  if (!prop) return null;
  if (/\bEXP\b/i.test(prop)) return 'EXP';
  if (/\bDA\b/i.test(prop)) return 'DA';
  return null;
};

// Vulnerability (wiki): no Immunity against the bracketed weapon, e.g. any
// weapon with "Viral" in its name. Returns the bracketed name, or null.
function vulnerabilityTo(targetTraits, row) {
  const name = (row?.name ?? '').toLowerCase();
  return (targetTraits?.skills ?? [])
    .filter((s) => s.id === SKILL.VULNERABILITY)
    .flatMap((s) => s.extra ?? [])
    .find((e) => name.includes(e.toLowerCase())) ?? null;
}

const hasImmunity = (targetTraits, kind, row) =>
  hasSkill(targetTraits, SKILL.IMMUNITY, kind) && !vulnerabilityTo(targetTraits, row);

// Plasma's combined save counts as ARM: its BTS half is a plain Saving Roll,
// with nothing for an Immunity to ignore.
const saveAttribute = (row) => ((row?.saving ?? '').startsWith('BTS') ? 'BTS' : 'ARM');

function immunityFor(targetTraits, row) {
  if (!row) return null;
  if (hasSkill(targetTraits, SKILL.IMMUNITY, 'Enhanced')) return 'Enhanced';
  const attr = saveAttribute(row);
  return hasSkill(targetTraits, SKILL.IMMUNITY, attr) ? attr : null;
}

// Immunity (ARM) / (BTS) (wiki): when the Saving Roll uses that Attribute, the
// Ammunition is treated as Normal: one Saving Roll per hit, one Wound per
// failure, Attribute not halved. Weapon Traits that cause States, reduce the
// Attribute or refer to Wounds (ARM=0, Continuous Damage) are ignored too. A
// Critical still adds its Saving Roll, and a combined ARM+BTS save (Plasma)
// still rolls both. Immunity (Enhanced) is Immunity (ARM) plus Immunity (BTS).
// Returns the bracketed name of the Immunity that applies, or null.
export function immunityAgainst(targetTraits, row) {
  return vulnerabilityTo(targetTraits, row) ? null : immunityFor(targetTraits, row);
}

const hasContinuousDamage = (row, mods) => Boolean(mods?.cont) || (row?.props ?? []).includes('Continous Damage');

// Non-Lethal weapons, and ones without Ammunition (Sepsitor), cause States
// instead of Wounds.
const causesWounds = (row) => row.ammo != null && !(row.props ?? []).includes('Non-lethal');

// Against an Immunity those States are ignored too, so nothing is left of the
// attack. The exception is State: Stunned, which always applies (wiki example
// 4, Flash Pulse).
// An attack that cannot affect its target opposes nothing (wiki, Face to Face
// Rolls): it gets burst 0 and the target makes a Normal Roll.
export const hasNoEffect = (targetTraits, row) =>
  Boolean(immunityAgainst(targetTraits, row))
  && !causesWounds(row)
  && !(row.props ?? []).some((p) => p.startsWith('State: Stunned'));

// What the Immunity takes away from this attack, for the matchup note.
function immunityNote(immunity, row, mods) {
  const parts = [];
  const ammo = (row.ammo ?? 'N').split('+').filter((a) => a !== 'N');
  if (mods?.forceAP && !ammo.includes('AP')) ammo.unshift('AP');
  const bio = (row.props ?? []).find((p) => p.startsWith('Bioweapon ('));
  if (bio) ammo.push(bio);
  if (ammo.length > 0) parts.push(`${ammo.join('+')} treated as N`);
  const traits = [];
  if (row.saving === 'ARM=0') traits.push('ARM=0');
  if (hasContinuousDamage(row, mods)) traits.push('Continuous Damage');
  if (traits.length > 0) parts.push(`${traits.join(', ')} ignored`);
  return parts.length > 0 ? `target has Immunity (${immunity}); ${parts.join('; ')}` : null;
}

export function calcAmmo(row, targetTraits) {
  if (row.saves === '1 and 1') return 'PLASMA';
  if (immunityAgainst(targetTraits, row)) return 'N';
  if (row.saves === '2') return 'DA';
  if (row.saves === '3') return 'EXP';
  const bio = bioweaponAmmo(row);
  if (bio) return bio;
  if (['T2', 'AP+T2'].includes(row.ammo)) return 'T2';
  return 'N';
}

const hasShockAmmo = (row) =>
  /\bshock\b/i.test(row?.ammo ?? '') || (row?.props ?? []).some((p) => p.startsWith('Bioweapon (') && /\bshock\b/i.test(p));

// Shock (wiki): a target with VITA 1 that fails a Saving Roll skips
// Unconscious and goes straight to Dead, which the calculator counts as one
// extra wound. Troopers with STR or with 2+ VITA are unaffected. Immunity
// (Shock), and Immunity (ARM) / (BTS) / (Enhanced) on that save, treat the hit
// as Normal Ammunition. Vulnerability cancels any of them.
export function shockApplies(row, target) {
  if (!hasShockAmmo(row) || !target?.profile) return false;
  if (target.profile.str || target.profile.w !== 1) return false;
  return !immunityAgainst(target.traits, row) && !hasImmunity(target.traits, 'Shock', row);
}

const IGNORED = [
  ['skill', SKILL.LIMITED_COVER, 'Limited Cover'],
  ['skill', SKILL.SAPPER, 'Sapper'],
  ['skill', SKILL.SURPRISE_ATTACK, 'Surprise Attack'],
  ['skill', SKILL.MARKSMANSHIP, 'Marksmanship'],
  ['skill', SKILL.SIXTH_SENSE, 'Sixth Sense'],
];

// Names of traits on this side that the converter does not model yet.
function unsupportedTraits(side) {
  if (!side?.traits) return [];
  const found = IGNORED
    .filter(([kind, id]) => (kind === 'skill' ? hasSkill(side.traits, id) : hasEquip(side.traits, id)))
    .map(([, , name]) => name);
  if (fireteamBonuses(side.ftSize).sixthSense) found.push('Sixth Sense');
  return found;
}

// Spec-Ops trooper? Only the Initial profile lists the skill, so check the group.
const isSpecOps = (side) =>
  (side?.group?.profiles ?? []).some((p) => (p.skills ?? []).some((sk) => sk.id === SKILL.SPEC_OPS));

function approximationWarnings(label, side, target) {
  const warnings = [];
  const row = side?.weapon?.row;
  if (row && hasNoEffect(target?.traits, row)) {
    warnings.push(`${label}: ${row.name} has no effect on a target with Immunity (${immunityAgainst(target.traits, row)}); not rolled`);
  } else if (row && (row.props ?? []).includes('Non-lethal')) {
    warnings.push(`${label}: ${row.name} is non-lethal; results shown as wounds`);
  }
  for (const name of side?.unsupportedUpgradeWeapons ?? []) {
    warnings.push(`${label}: ${name} (upgrade) not supported by the calculator`);
  }
  return warnings;
}

// Burst, SD and BS bonuses on a BS Attack, summed over the weapon's loadout
// extras, the profile's BS Attack (+1SD / +1B) skill and the Fireteam.
// Templates keep their burst bonuses but don't roll, so get no SD or BS.
function attackBonuses(x) {
  const row = x.weapon?.row;
  if (!row) return {burst: 0, sd: 0, bs: 0, skillBurst: 0};
  const skillMods = parseWeaponMods(
    (x.traits?.skills ?? [])
      .filter((s) => s.id === SKILL.BS_ATTACK)
      .flatMap((s) => s.extra ?? [])
      .filter((e) => /^\+\d+(B|SD)$/.test(e)),
  );
  const burst = x.weapon.mods.burst + skillMods.burst;
  if (isTemplate(row)) return {burst, sd: 0, bs: 0, skillBurst: skillMods.burst};
  const ft = fireteamBonuses(x.ftSize);
  return {
    burst,
    sd: x.weapon.mods.sd + skillMods.sd + ft.sd,
    bs: ft.bs,
    skillBurst: skillMods.burst,
  };
}

// Weapons with the BS Weapon (PH) / (WIP) trait roll against that attribute
// instead of BS (e.g. Grenades, Flash Pulse). BS MODs still apply.
export function attackStat(profile, row) {
  const props = row?.props ?? [];
  if (props.includes('BS Weapon (PH)')) return profile?.ph ?? 0;
  if (props.includes('BS Weapon (WIP)')) return profile?.wip ?? 0;
  return profile?.bs ?? 0;
}

// Only Total Reaction / Neurocinetics keep their full burst in ARO.
const keepsAroBurst = (x) => hasSkill(x.traits, SKILL.TOTAL_REACTION) || hasSkill(x.traits, SKILL.NEUROCINETICS);

function attackInputs(x, y, rangeCm, side, errors, notes) {
  const label = side === 'A' ? 'Active' : 'Reactive';
  const {row, mods} = x.weapon;
  let rangeMod = rangeModFor(row, rangeCm, x.traits);
  // Out of range: the attack still happens but always fails. A success value
  // of 0 misses on every roll, with no crit.
  const outOfRange = rangeMod === null;
  if (outOfRange) rangeMod = 0;
  const mim = y ? mimetismMod(y.traits, x.traits) : 0;
  const albedo = y ? albedoMod(y.traits, x.traits) : 0;
  const cover = benefitsFromCover(y) || hasNanoscreen(y) ? -3 : 0;
  const bonus = attackBonuses(x);
  const sv = outOfRange
    ? 0
    : clamp(LIMITS.successValue, attackStat(x.profile, row) + rangeMod + mim + albedo + cover + mods.sv + bonus.bs);

  const noEffect = hasNoEffect(y?.traits, row);
  let burst = (row.burst ?? 1) + bonus.burst;
  if (side === 'B' && !keepsAroBurst(x)) burst = 1;
  if (noEffect) burst = 0;
  const immunity = immunityAgainst(y?.traits, row);
  const out = {
    [`successValue${side}`]: sv,
    [`burst${side}`]: clamp(LIMITS.burst, burst),
    [`bonusBurst${side}`]: noEffect ? 0 : clamp(LIMITS.bonusBurst, bonus.sd),
    [`damage${side}`]: clamp(LIMITS.damage, mods.ps ?? row.dmg),
    [`ammo${side}`]: calcAmmo(row, y?.traits),
    [`cont${side}`]: !immunity && hasContinuousDamage(row, mods),
    [`shock${side}`]: shockApplies(row, y),
  };
  if (out[`shock${side}`]) notes.push(`${label}: Shock against VITA 1; a failed save is Dead, counted as one extra wound`);
  // State-only weapons get a warning instead (no effect), or play as always (Stunned).
  const note = immunity && causesWounds(row) && immunityNote(immunity, row, mods);
  if (note) notes.push(`${label}: ${note}`);
  const vulnerable = vulnerabilityTo(y?.traits, row);
  const lost = vulnerable && immunityFor(y.traits, row);
  if (lost) notes.push(`${label}: target has Vulnerability (${vulnerable}); Immunity (${lost}) does not apply`);
  return out;
}

function defenseInputs(y, incoming, side) {
  const p = y.profile;
  const saving = incoming?.row?.saving ?? 'ARM';
  // Immune: the Attribute is rolled as printed, no ARM=0 and no AP halving.
  const immune = Boolean(immunityAgainst(y.traits, incoming?.row));
  let base = saving.startsWith('BTS') ? p.bts : saving === 'ARM=0' && !immune ? 0 : p.arm;
  base = Math.max(0, base ?? 0);
  const halve = saving.endsWith('/2') || Boolean(incoming?.mods?.forceAP);
  const apImmune = immune || hasImmunity(y.traits, 'AP', incoming?.row);
  if (halve && !apImmune) base = Math.ceil(base / 2);
  // Cover's +3 is a Saving Roll MOD, not ARM: add it after AP halving. The
  // calculator saves on d20 <= PS + ARM, so this input is where the MOD goes.
  const templateIncoming = ignoresCoverOnSaves(incoming?.row);
  const coverSave = benefitsFromCover(y) && !templateIncoming ? 3 : 0;
  const nanoSave = hasNanoscreen(y) ? 3 : 0;
  const cover = Math.max(coverSave, nanoSave);
  return {
    [`arm${side}`]: clamp(LIMITS.arm, base + cover),
    [`bts${side}`]: clamp(LIMITS.bts, Math.max(0, p.bts ?? 0) + cover),
    [`critImmune${side}`]: hasImmunity(y.traits, 'Critical', incoming?.row),
  };
}

const MODELED_SKILLS = [SKILL.MIMETISM, SKILL.NO_COVER, SKILL.TOTAL_REACTION, SKILL.NEUROCINETICS, SKILL.VULNERABILITY];
const MODELED_EQUIP = [EQUIP.NANOSCREEN, EQUIP.MSV1, EQUIP.MSV2, EQUIP.MSV3, EQUIP.X_VISOR, EQUIP.ALBEDO];
const MODELED_IMMUNITIES = ['AP', 'ARM', 'BTS', 'Critical', 'Enhanced', 'Shock'];
const traitLabel = (t) => (t.extra?.length ? `${t.name} (${t.extra.join(', ')})` : t.name);

// Skills, equipment and state on this side that the converter actually uses,
// for the matchup summary. Order follows the profile, then the roll bonuses
// that apply to the chosen action (Fireteam included), summed per kind.
// `role` is 'A' (active) or 'B' (reactive).
export function matchupTraits(side, role = 'A') {
  if (!side?.traits) return [];
  const out = [];
  for (const s of side.traits.skills) {
    if (MODELED_SKILLS.includes(s.id)) out.push(traitLabel(s));
    else if (s.id === SKILL.IMMUNITY && (s.extra ?? []).some((e) => MODELED_IMMUNITIES.includes(e))) out.push(traitLabel(s));
  }
  for (const e of side.traits.equip) {
    if (MODELED_EQUIP.includes(e.id)) out.push(traitLabel(e));
  }
  if (benefitsFromCover(side)) out.push('In cover');
  out.push(...(side.upgrades ?? []).map((u) => u.label));
  out.push(...rollBonusLabels(side, role));
  return [...new Set(out)];
}

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;

function rollBonusLabels(side, role) {
  const ft = fireteamBonuses(side.ftSize);
  if (side.weapon?.pseudo === 'dodge') {
    const extra = skillExtra(side.traits, SKILL.DODGE);
    const mod = extra && /^[+-]\d+$/.test(extra) ? Number(extra) : 0;
    const labels = [];
    // "Dodge (PH=14)" replaces PH; the Fireteam MOD still applies on top.
    if (extra && !/^[+-]\d+$/.test(extra)) labels.push(`Dodge (${extra})`);
    if (mod + ft.dodge !== 0) labels.push(`Dodge ${signed(mod + ft.dodge)}`);
    return labels;
  }
  const b = attackBonuses(side);
  const labels = [];
  if (b.skillBurst > 0 && (role === 'A' || keepsAroBurst(side))) labels.push(`+${b.skillBurst}B`);
  if (b.sd > 0) labels.push(`+${b.sd}SD`);
  if (b.bs > 0) labels.push(`BS+${b.bs}`);
  return labels;
}

// Builds the partial calculator input object for both sides.
// `active` / `reactive` are results of resolveSelection() (or null).
export function deriveInputs({active, reactive, rangeCm}) {
  const inputs = {};
  const errors = [];
  const notes = [];
  // A side still waiting on its weapon: nothing to report, but not ready to apply.
  let incomplete = false;
  const a = active?.profile ? active : null;
  const b = reactive?.profile ? reactive : null;
  // A template with no effect on its target forces no Dodge.
  const usesTemplate = (x, y) => Boolean(x?.weapon?.row && isTemplate(x.weapon.row) && !hasNoEffect(y?.traits, x.weapon.row));
  const aTemplate = usesTemplate(a, b);
  const bTemplate = usesTemplate(b, a);

  if (a) {
    if (!a.weapon) {
      incomplete = true;
    } else if (a.weapon.pseudo === 'dodge') {
      // The calculator only models templates against a dodging *reactive* trooper.
      if (bTemplate) errors.push('Active Dodge against a reactive template weapon is not supported');
      inputs.ammoA = 'DODGE';
      inputs.burstA = 1;
      inputs.bonusBurstA = 0;
      inputs.successValueA = dodgeSuccessValue(a.profile, a.traits, fireteamBonuses(a.ftSize).dodge);
      inputs.contA = false;
      inputs.shockA = false;
      inputs.dtwVsDodge = false;
    } else if (a.weapon.pseudo) {
      incomplete = true; // e.g. "No ARO" carried over; the active side needs a real choice
    } else if (attackStat(a.profile, a.weapon.row) <= 0) {
      errors.push('Active: this profile cannot make BS attacks; pick Dodge');
    } else {
      Object.assign(inputs, attackInputs(a, b, rangeCm, 'A', errors, notes));
      inputs.dtwVsDodge = aTemplate;
    }
    if (b?.weapon?.row) Object.assign(inputs, defenseInputs(a, b.weapon, 'A'));
    else if (b) Object.assign(inputs, defenseInputs(a, null, 'A'));
  }

  if (b) {
    if (!b.weapon) {
      incomplete = true;
    } else if (aTemplate || b.weapon.pseudo === 'dodge') {
      if (aTemplate && !b.weapon.pseudo) notes.push('Reactive: template weapon forces a Dodge');
      inputs.ammoB = 'DODGE';
      inputs.burstB = 1;
      inputs.bonusBurstB = 0;
      inputs.successValueB = dodgeSuccessValue(b.profile, b.traits, fireteamBonuses(b.ftSize).dodge);
      inputs.contB = false;
      inputs.shockB = false;
    } else if (b.weapon.pseudo === 'none') {
      inputs.burstB = 0;
      inputs.bonusBurstB = 0;
      inputs.shockB = false;
    } else if (attackStat(b.profile, b.weapon.row) <= 0) {
      errors.push('Reactive: this profile cannot make BS attacks; pick Dodge or No ARO');
    } else {
      Object.assign(inputs, attackInputs(b, a, rangeCm, 'B', errors, notes));
    }
    if (a?.weapon?.row) Object.assign(inputs, defenseInputs(b, a.weapon, 'B'));
    else if (a) Object.assign(inputs, defenseInputs(b, null, 'B'));
  }

  if (a || b) inputs.fixedFaceToFace = false;
  // Things the result may get wrong; shown as alerts but don't block the calculation.
  const warnings = [];
  const unsupported = [...new Set([...unsupportedTraits(a), ...unsupportedTraits(b)])];
  if (unsupported.length > 0) warnings.push(`Support for ${unsupported.join(', ')} not implemented yet`);
  warnings.push(...approximationWarnings('Active', a, b), ...approximationWarnings('Reactive', b, a));
  if (isSpecOps(a) || isSpecOps(b)) warnings.push('Spec-Ops upgrades and SpecBall not supported yet');

  return {inputs, ok: errors.length === 0 && !incomplete && (a !== null || b !== null), errors, warnings, notes};
}

// Lowercase, accent-free form for unit search: "Nøkken" -> "nokken". NFD
// splits most accents off as combining marks; letters like ø and æ don't
// decompose, so map them by hand.
const LETTER_FOLDS = {ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', đ: 'd', ł: 'l', þ: 'th'};
export function searchKey(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øæœßđłþ]/g, (c) => LETTER_FOLDS[c]);
}
