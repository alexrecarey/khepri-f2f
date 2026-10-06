// Words players type that no matching rule can derive from the data. Keyed by
// the exact weapon or unit name in army.json; each alias becomes one more
// searchable word on every row carrying it. Initials of multi-word names
// (hmg, msr, gl) are generated automatically, so only add what they miss.
// Add a line whenever someone searches for something reasonable and gets nothing.

export const WEAPON_ALIASES = {
  'Missile Launcher': ['ml'],
  'Heavy Machine Gun': ['hmg'],
  'AP Heavy Machine Gun': ['hmg', 'aphmg'],
  'MULTI Heavy Machine Gun': ['hmg', 'mhmg'],
  'Spitfire': ['spit'],
  'AP Spitfire': ['spit'],
  'Spitfire MULTI': ['spit'],
  'Boarding Shotgun': ['bsg'],
  'T2 Boarding Shotgun': ['bsg'],
  'Light Shotgun': ['lsg'],
  'Heavy Shotgun': ['hsg'],
  'Vulkan Shotgun': ['vsg'],
  'Submachine Gun': ['smg'],
  'AP Submachine Gun': ['smg'],
  'Light Flamethrower': ['lft', 'flamer'],
  'Heavy Flamethrower': ['hft', 'flamer'],
  'Heavy Rocket Launcher': ['hrl'],
  'Light Rocket Launcher': ['lrl'],
  'Hyper-Rapid Magnetic Cannon': ['hmc', 'hrmc'],
  'Portable Autocannon': ['pac'],
  'Marksman Rifle': ['mr'],
  'MULTI Marksman Rifle': ['mmr'],
  'MULTI Sniper Rifle': ['msr'],
  'MULTI Rifle': ['mr', 'multi'],
  'Combi Rifle': ['combi'],
  'K1 Combi Rifle': ['k1'],
  'K1 Sniper Rifle': ['k1'],
  'K1 Marksman Rifle': ['k1'],
  'Plasma Rifle': ['pr'],
  'Plasma Sniper Rifle': ['psr'],
  'Grenade Launcher': ['gl'],
  'Red Fury': ['fury'],
  'MULTI Red Fury': ['fury'],
  'AP Red Fury': ['fury'],
  'Chain Rifle': ['chain'],
  'Nanopulser': ['nano'],
};

export const UNIT_ALIASES = {
  // 'Exact ISC from army.json': ['nickname'],
};
