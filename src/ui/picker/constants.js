// Names and quick searches both pickers share.
export const TYPE_NAMES = {
  LI: 'Light Infantry', MI: 'Medium Infantry', HI: 'Heavy Infantry', TAG: 'TAGs',
  REM: 'REMs', SK: 'Skirmishers', WB: 'Warbands', VH: 'Vehicles',
};
export const TYPE_ORDER = Object.keys(TYPE_NAMES);

// One tap fills the box with what players often look for on that side: big
// burst for the active trooper, ARO picks for the reactive one. Each query
// also finds the variants ("hmg": AP and MULTI HMG; "spitfire": AP / MULTI).
export const QUICK = {
  A: [['HMG', 'hmg'], ['Spitfire', 'spitfire'], ['Red Fury', 'red fury']],
  B: [['+SD', '+SD'], ['Neurocinetics', 'neurocinetics'], ['Total Reaction', 'total reaction'],
    ['Missile Launcher', 'missile launcher'], ['HRL', 'hrl'], ['Sniper Rifle', 'sniper rifle']],
};
