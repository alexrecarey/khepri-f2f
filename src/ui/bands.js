// Infinity's range-band colours for a Range MOD. Nothing (the card shows
// through) when there is no band to colour: no weapon yet, a Dodge, a Direct
// Template (no range bands) or out of range.
// "+3", "0", "−3"; "—" when there is no Range MOD.
export const signedMod = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}`);

export const bandColor = (mod) => {
  if (mod == null) return 'transparent';
  if (mod > 0) return 'var(--band-plus)';
  if (mod === 0) return 'var(--band-zero)';
  return mod <= -6 ? 'var(--band-minus6)' : 'var(--band-minus3)';
};
