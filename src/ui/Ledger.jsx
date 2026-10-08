// "How the dice were built": one card per side at the end of the results
// sheet (the mods column on wide screens). Sections Success Value / the save
// the target makes / Burst, each a short sum: value, what it is, and who or
// what it comes from. Lines are coloured by the side that caused them;
// cancelled lines are struck through and say what cancelled them.
import PropTypes from 'prop-types';
import {shortWeaponName} from './names.js';

const COLOR = {A: 'var(--active)', B: 'var(--reactive)'};
// The source column is narrow: "Fennec" for Fennec Fusiliers.
const firstWord = (name) => (name ?? '').split(' ')[0];
const signed = (v, first) => (typeof v !== 'number' || first || v === 0 ? `${v}` : `${v > 0 ? '+' : '−'}${Math.abs(v)}`);

// lines: the section's lines; base: the source of the starting line ("profile",
// the weapon) when no side caused it.
function Section({title, lines, total, abbr, base, names}) {
  return (
    <div className="mods-sec">
      <span className="mods-h">{title}</span>
      <div className="mods-rows">
        {lines.map((l, i) => {
          const source = l.struck ? l.struck : l.by ? firstWord(names[l.by]) : i === 0 ? base : 'rule';
          return (
            <div key={i} className={l.struck ? 'mods-row struck' : 'mods-row'} style={{color: l.struck ? undefined : COLOR[l.by]}}>
              <span className="v">{signed(l.value, i === 0)}</span>
              <span className="l" title={l.label}>{l.label}</span>
              <span className="s">{source}</span>
            </div>
          );
        })}
        <div className="mods-total"><span className="v">{total}</span><span className="l">{abbr}</span></div>
      </div>
    </div>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired, lines: PropTypes.array.isRequired, total: PropTypes.node.isRequired,
  abbr: PropTypes.string.isRequired, base: PropTypes.string.isRequired, names: PropTypes.object.isRequired,
};

export function SideMods({side, l, names, weapon}) {
  const color = side === 'A' ? 'active' : 'reactive';
  const weaponName = shortWeaponName(weapon ?? 'weapon');
  const sd = l.sd?.lines.length ? l.sd.lines.map((x) => ({...x, label: `${x.label} (SD)`})) : [];
  return (
    <section className="mods-card" aria-label={`${color} mods`}>
      <div className={`mods-top c-${color}`}><span>{side === 'A' ? 'ACTIVE' : 'REACTIVE'} MODS</span><span>{l.dice}</span></div>
      {l.kind === 'none' && <span className="note">No ARO: does not roll.</span>}
      {l.sv && (
        <Section title={l.kind === 'dodge' ? 'DODGE' : 'SUCCESS VALUE'} lines={l.sv.lines} total={l.sv.total}
          abbr={l.kind === 'dodge' ? 'PH' : 'SV'} base="profile" names={names} />
      )}
      {l.kind === 'template' && (
        <div className="mods-sec"><span className="mods-h">SUCCESS VALUE</span><span className="note">Direct Template: hits automatically</span></div>
      )}
      {l.save && <Section title="SAVE THE TARGET MAKES" lines={l.save.lines} total={l.save.total} abbr="PS" base={weaponName} names={names} />}
      {l.burst && (
        <Section title="BURST" lines={[...l.burst.lines, ...sd]} abbr="B" base="weapon" names={names}
          total={`${l.burst.total}${l.sd?.total ? `+${l.sd.total}` : ''}`} />
      )}
      {l.save && l.note && <span className="note">{l.note}</span>}
      {l.sv?.note && <span className="note">{l.sv.note}</span>}
    </section>
  );
}

SideMods.propTypes = {side: PropTypes.string.isRequired, l: PropTypes.object.isRequired, names: PropTypes.object.isRequired, weapon: PropTypes.string};

export default function Ledger({ledger, names, notes, weapons = {}}) {
  return (
    <div className="ledger">
      {ledger.A && <SideMods side="A" l={ledger.A} names={names} weapon={weapons.A} />}
      {ledger.B && <SideMods side="B" l={ledger.B} names={names} weapon={weapons.B} />}
      {notes.map((n) => <span key={n} className="note">{n}</span>)}
    </div>
  );
}

Ledger.propTypes = {ledger: PropTypes.object.isRequired, names: PropTypes.object.isRequired, notes: PropTypes.array.isRequired, weapons: PropTypes.object};
