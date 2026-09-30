// Army ids of the skills and equipment the calculator looks at. The names are
// what the Army data calls them; scripts/fetch-army.mjs fails if an id stops
// resolving to its name, so a renumbering in a new release can't slip through.

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
};

const EQUIPS = {
  NANOSCREEN: [108, 'Nanoscreen'],
  MSV1: [114, 'Multispectral Visor L1'],
  MSV2: [115, 'Multispectral Visor L2'],
  MSV3: [116, 'Multispectral Visor L3'],
  X_VISOR: [117, 'X Visor'],
  ALBEDO: [183, 'Albedo'],
};

const ids = (table) => Object.fromEntries(Object.entries(table).map(([k, [id]]) => [k, id]));

export const SKILL = ids(SKILLS);
export const EQUIP = ids(EQUIPS);

// {skill: [[id, name], ...], equip: [...]} for the pipeline's check.
export const EXPECTED_NAMES = {skill: Object.values(SKILLS), equip: Object.values(EQUIPS)};
