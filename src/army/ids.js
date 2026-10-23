// Army ids of the skills and equipment the calculator looks at. The names are
// what the Army data calls them; scripts/fetch-army.mjs fails if an id stops
// resolving to its name, so a renumbering in a new release can't slip through.

/** @type {Record<string, [number, string]>} */
const SKILLS = {
  MIMETISM: [28, 'Mimetism'],
  DODGE: [40, 'Dodge'],
  TOTAL_REACTION: [61, 'Total Reaction'],
  SIXTH_SENSE: [67, 'Sixth Sense'],
  SAPPER: [89, 'Sapper'],
  NEUROCINETICS: [109, 'Neurocinetics'],
  MARKSMANSHIP: [156, 'Marksmanship'],
  IMMUNITY: [162, 'Immunity'],
  SURPRISE_ATTACK: [191, 'Surprise Attack'],
  VULNERABILITY: [220, 'Vulnerability'],
  NO_COVER: [264, 'No Cover'],
  LIMITED_COVER: [268, 'Limited Cover'],
  BS_ATTACK: [201, 'BS Attack'],
  TEAM_OPS: [282, 'Infinity Team-Ops'],
  SPEC_OPS: [281, 'Infinity Spec-Ops'],
  WARHORSE: [267, 'Warhorse'],
  COMBAT_INSTINCT: [262, 'Combat Instinct'],
  DOGGED: [85, 'Dogged'],
  NWI: [86, 'No Wound Incapacitation'],
  REMOTE_PRESENCE: [235, 'Remote Presence'],
  LIEUTENANT: [119, 'Lieutenant'],
  PERIPHERAL: [243, 'Peripheral'],
  MARTIAL_ARTS_L1: [19, 'Martial Arts L1'],
  MARTIAL_ARTS_L2: [20, 'Martial Arts L2'],
  MARTIAL_ARTS_L3: [21, 'Martial Arts L3'],
  MARTIAL_ARTS_L4: [22, 'Martial Arts L4'],
  MARTIAL_ARTS_L5: [23, 'Martial Arts L5'],
  NATURAL_BORN_WARRIOR: [39, 'Natural Born Warrior'],
  CC_ATTACK: [240, 'CC Attack'],
  BERSERK: [24, 'Berserk'],
  HACKER: [1000, 'Hacker'],
};

/** @type {Record<string, [number, string]>} */
const EQUIPS = {
  NANOSCREEN: [108, 'Nanoscreen'],
  MSV1: [114, 'Multispectral Visor L1'],
  MSV2: [115, 'Multispectral Visor L2'],
  MSV3: [116, 'Multispectral Visor L3'],
  X_VISOR: [117, 'X Visor'],
  ALBEDO: [183, 'Albedo'],
  BANGBOMB: [246, 'Bangbomb'],
  TINBOT_FIREWALL: [169, 'TinBot: Firewall'],
  HACKING_DEVICE: [100, 'Hacking Device'],
  HACKING_DEVICE_PLUS: [101, 'Hacking Device Plus'],
  KILLER_HACKING_DEVICE: [145, 'Killer Hacking Device'],
  EVO_HACKING_DEVICE: [182, 'EVO Hacking Device'],
  ECM_HACKER: [241, 'ECM: Hacker'],
};

/** @param {Record<string, [number, string]>} table */
const ids = (table) => Object.fromEntries(Object.entries(table).map(([k, [id]]) => [k, id]));

export const SKILL = ids(SKILLS);
export const EQUIP = ids(EQUIPS);

// {skill: [[id, name], ...], equip: [...]} for the pipeline's check.
/** @type {Record<'skill' | 'equip', [number, string][]>} */
export const EXPECTED_NAMES = {skill: Object.values(SKILLS), equip: Object.values(EQUIPS)};
