// "How the dice were built": one card per side at the end of the results
// sheet (the mods column on wide screens). Sections Success Value / the save
// the target makes / Burst, each a short sum: value, what it is, and who or
// what it comes from. Lines are coloured by the side that caused them;
// cancelled lines are struck through and say what cancelled them.
import {shortWeaponName} from '../army/names.js';
import {useT} from './i18n.jsx';

// Lines are coloured by the side that caused them (.c-active / .c-reactive).
/** @typedef {import('../types.js').Line} Line */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */
/** @typedef {{A: string, B: string}} Tags */

/** @type {Record<string, string>} */
const SIDE_CLASS = {A: 'c-active', B: 'c-reactive'};
// The first line is the Attribute (no sign); a display-only line shows its text.
/**
 * @param {number} v
 * @param {boolean} first
 */
const signed = (v, first) => (first || v === 0 ? `${v}` : `${v > 0 ? '+' : '−'}${Math.abs(v)}`);

// lines: the section's lines; base: the source of the starting line ("profile",
// the weapon) when no side caused it. tags: each side's trooper as the
// narrow source column names it ("Fennec", "Hac Tao"; src/army/names.js).
/** @param {{title: string, lines: Line[], total: import('react').ReactNode, abbr: string, base: string, tags: Tags}} props */
function Section({title, lines, total, abbr, base, tags}) {
  const t = useT();
  // Keyed by what the line is, so a line struck or added on a change keeps
  // its own row (and its strike animation) instead of its neighbour's.
  /** @type {Map<string, number>} */
  const seen = new Map();
  /** @param {Line} l */
  const keyOf = (l) => {
    const k = `${l.label}|${l.by ?? ''}`;
    seen.set(k, (seen.get(k) ?? 0) + 1);
    return `${k}|${seen.get(k)}`;
  };
  return (
    <div className="mods-sec">
      <span className="mods-h">{title}</span>
      <div className="mods-rows">
        {lines.map((l, i) => {
          // Rendered lines (rules/ledger.js renderDerived): every Message a string.
          const source = /** @type {string} */ (l.struck ? l.struck : l.source ?? (l.by ? tags[l.by] : i === 0 ? base : t('ledger.rule')));
          return (
            <div key={keyOf(l)} className={l.struck ? 'mods-row struck' : `mods-row${SIDE_CLASS[/** @type {string} */ (l.by)] ? ` ${SIDE_CLASS[/** @type {string} */ (l.by)]}` : ''}`}>
              {/* A line without a text has a value. */}
              <span className="v">{l.text ?? signed(/** @type {number} */ (l.value), i === 0)}</span>
              <span className="l" title={/** @type {string} */ (l.label)}>{/** @type {string} */ (l.label)}</span>
              <span className="s">{source}</span>
            </div>
          );
        })}
        <div className="mods-total"><span className="v">{total}</span><span className="l">{abbr}</span></div>
      </div>
    </div>
  );
}

// A Dodge rolls PH, a Reset WIP; anything else shows its Success Value.
/** @type {Record<string, string>} */
const EVADE_ABBR = {dodge: 'stat.ph', reset: 'stat.wip'};

/** @param {{side: import('../types.js').Side, l: LedgerSide, tags: Tags, weapon?: string}} props */
export function SideMods({side, l, tags, weapon}) {
  const t = useT();
  const color = side === 'A' ? 'active' : 'reactive';
  /** @param {string} text */
  const upper = (text) => text.toLocaleUpperCase(t.lang);
  const weaponName = shortWeaponName(weapon ?? t('ledger.weapon'), t.lang);
  const sd = l.sd?.lines.length ? l.sd.lines.map((x) => ({...x, label: `${x.label} (${t('abbr.SD')})`})) : [];
  const svTitle = upper(l.kind === 'dodge' || l.kind === 'reset' ? t(`pseudo.${l.kind}`) : t('ledger.successValue'));
  return (
    <section className="mods-card" aria-label={t('ledger.mods', {side: t(`side.${color}`)})}>
      <div className={`mods-top c-${color}`}>{upper(t('ledger.mods', {side: t(`side.${color}`)}))}</div>
      {l.kind === 'none' && <span className="note">{l.reason ?? t('ledger.noAro')}</span>}
      {l.sv && (
        <Section title={svTitle} lines={l.sv.lines} total={/** @type {number} */ (l.sv.total)}
          abbr={t(EVADE_ABBR[l.kind] ?? 'abbr.SV')} base={t('ledger.profile')} tags={tags} />
      )}
      {l.kind === 'template' && (
        <div className="mods-sec"><span className="mods-h">{upper(t('ledger.successValue'))}</span><span className="note">{t('ledger.templateHits')}</span></div>
      )}
      {l.save && <Section title={upper(t('ledger.saveTitle'))} lines={l.save.lines} total={/** @type {number} */ (l.save.total)} abbr={t('abbr.PS')} base={weaponName} tags={tags} />}
      {l.burst && (
        <Section title={upper(t('ledger.burstTitle'))} lines={[...l.burst.lines, ...sd]} abbr={t('abbr.B')} base={t('ledger.weapon')} tags={tags}
          total={`${l.burst.total}${l.sd?.total ? `+${/** @type {number} */ (l.sd.total)}` : ''}`} />
      )}
      {/* Ammo names don't fit the value column: the total goes in the label's. */}
      {l.ammo && <Section title={upper(t('ledger.ammoTitle'))} lines={l.ammo.lines} total="" abbr={/** @type {string} */ (l.ammo.total)} base={weaponName} tags={tags} />}
      {l.save && l.note && <span className="note">{l.note}</span>}
      {l.sv?.note && <span className="note">{/** @type {string} */ (l.sv.note)}</span>}
      {/* The dice it all adds up to (B4 SV15 PS7) come last, read after the sums. */}
      {l.dice && <div className={`mods-foot c-${color}`}>{l.dice}</div>}
    </section>
  );
}

/** @param {{ledger: import('../types.js').Ledger, tags: Tags, notes: string[], weapons?: {A?: string, B?: string}}} props */
export default function Ledger({ledger, tags, notes, weapons = {}}) {
  return (
    <div className="ledger">
      {ledger.A && <SideMods side="A" l={ledger.A} tags={tags} weapon={weapons.A} />}
      {ledger.B && <SideMods side="B" l={ledger.B} tags={tags} weapon={weapons.B} />}
      {notes.map((n) => <span key={n} className="note">{n}</span>)}
    </div>
  );
}
