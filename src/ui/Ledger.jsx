// "How the dice were built": one card per side at the end of the results
// sheet. Columns Burst / SV / PS, each a short sum; every line coloured by the
// side that caused it, cancelled lines struck through with the reason.
import PropTypes from 'prop-types';

const COLOR = {A: 'var(--active)', B: 'var(--reactive)'};
const signed = (v, first) => (typeof v !== 'number' || first || v === 0 ? `${v}` : `${v > 0 ? '+' : '−'}${Math.abs(v)}`);

function Column({title, sections, total}) {
  return (
    <div className="ledger-col">
      <span className="ledger-h">{title}</span>
      {sections.flatMap((sec, si) => sec.lines.map((l, i) => (
        <span key={`${si}-${i}`} className={l.struck ? 'ledger-l struck' : 'ledger-l'} style={{color: l.struck ? undefined : COLOR[l.by]}}
          title={l.struck ? `${l.label}: ${l.struck}` : l.label}>
          {signed(l.value, si === 0 && i === 0)} {l.label}
          {l.struck && <em> · {l.struck}</em>}
        </span>
      )))}
      <span className="ledger-t">{total}</span>
    </div>
  );
}

Column.propTypes = {title: PropTypes.string.isRequired, sections: PropTypes.array.isRequired, total: PropTypes.node.isRequired};

function SideLedger({side, name, l}) {
  const color = side === 'A' ? 'active' : 'reactive';
  return (
    <div className="ledger-card">
      <div className={`ledger-top c-${color}`}><span>{name}</span><span>{l.dice}</span></div>
      {l.kind === 'none' && <span className="note">No ARO: does not roll.</span>}
      {l.kind !== 'none' && (
        <div className="ledger-cols">
          {l.burst && (
            <Column title="BURST" sections={[l.burst, ...(l.sd?.lines.length ? [{lines: l.sd.lines.map((x) => ({...x, label: `${x.label} (SD)`}))}] : [])]}
              total={`B${l.burst.total}${l.sd?.total ? `+${l.sd.total}` : ''}`} />
          )}
          {l.sv && <Column title={l.kind === 'dodge' ? 'DODGE' : 'SV'} sections={[l.sv]} total={`SV${l.sv.total}`} />}
          {l.kind === 'template' && (
            <div className="ledger-col"><span className="ledger-h">SV</span><span className="ledger-l">Direct Template: hits automatically</span></div>
          )}
          {l.save && <Column title="PS" sections={[l.save]} total={`PS${l.save.total}`} />}
        </div>
      )}
      {l.save && <span className="note">The target saves on {l.save.total} or less{l.note ? ` · ${l.note}` : ''}</span>}
      {l.sv?.note && <span className="note">{l.sv.note}</span>}
    </div>
  );
}

SideLedger.propTypes = {side: PropTypes.string.isRequired, name: PropTypes.string.isRequired, l: PropTypes.object.isRequired};

export default function Ledger({ledger, names, notes}) {
  return (
    <div className="ledger">
      <div className="label" style={{borderTop: '1px solid var(--line)', paddingTop: 14}}>How the dice were built</div>
      {ledger.A && <SideLedger side="A" name={names.A} l={ledger.A} />}
      {ledger.B && <SideLedger side="B" name={names.B} l={ledger.B} />}
      <span className="note" style={{textAlign: 'center'}}>
        <span className="c-active">Green</span> = caused by the active trooper · <span className="c-reactive">pink</span> = by the reactive
      </span>
      {notes.map((n) => <span key={n} className="note">{n}</span>)}
    </div>
  );
}

Ledger.propTypes = {ledger: PropTypes.object.isRequired, names: PropTypes.object.isRequired, notes: PropTypes.array.isRequired};
