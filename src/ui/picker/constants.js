// Unit types in the order both pickers list them; their names are src/i18n's
// typeName.<type>.
export const TYPE_ORDER = ['LI', 'MI', 'HI', 'TAG', 'REM', 'SK', 'WB', 'VH'];
export const typeName = (t, type) => (type && t.has(`typeName.${type}`) ? t(`typeName.${type}`) : type ?? '');

// One tap fills the box with what players often look for on that side: big
// burst for the active trooper, ARO picks for the reactive one. Each query
// also finds the variants ("hmg": AP and MULTI HMG; "spitfire": AP / MULTI).
// Per language: the search index is in the app's language, so the queries are
// the words of that language's names.
export const QUICK = {
  en: {
    A: [['HMG', 'hmg'], ['Spitfire', 'spitfire'], ['Red Fury', 'red fury']],
    B: [['+SD', '+SD'], ['Neurocinetics', 'neurocinetics'], ['Total Reaction', 'total reaction'],
      ['Missile Launcher', 'missile launcher'], ['HRL', 'hrl'], ['Sniper Rifle', 'sniper rifle']],
  },
  es: {
    A: [['Ametralladora', 'ametralladora'], ['Spitfire', 'spitfire'], ['Red Fury', 'red fury']],
    // "+DE" (Dado Especial) would search for "de", in every Spanish name;
    // the index marks Special Dice as "sd" in every language.
    B: [['+DE', '+SD'], ['Neurocinética', 'neurocinetica'], ['Reacción Total', 'reaccion total'],
      ['Lanzamisiles', 'lanzamisiles'], ['Lanzacohetes Pesado', 'lanzacohetes pesado'], ['F. Francotirador', 'francotirador']],
  },
};
export const quickSearches = (lang, side) => (QUICK[lang] ?? QUICK.en)[side];
