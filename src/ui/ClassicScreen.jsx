// The classic calculator: type the final numbers yourself. Same inputs and
// the same hiding rules as before (src/CalculatorColumn.jsx), in the new design.
// The numbers are the state document's classic slice.
import {useMemo} from 'react';
import PropTypes from 'prop-types';
import {LIMITS} from '../engine/params.js';
import {dispatch} from '../state/store.js';
import {D20} from './icons.jsx';
import ResultsCard, {ResultsPanel} from './ResultsCard.jsx';
import useLayout from './useLayout.js';
import {classicRollSummary} from '../state/rolls.js';
import {summarize} from './results.js';
import useSaveRoll from './useSaveRoll.js';

const ROLE = {A: 'active', B: 'reactive'};
const AMMO = [['N', 'N'], ['DA', 'DA'], ['EXP', 'EXP'], ['T2', 'T2'], ['PLASMA', 'PLASMA'], ['DODGE', 'Dodge']];
// The highest Opponent PS the steppers reach: weapon PS + ARM (or BTS) limits.
const SAVE_LIMIT = {arm: [0, LIMITS.damage[1] + LIMITS.arm[1]], bts: [0, LIMITS.damage[1] + LIMITS.bts[1]]};
const clamp = ([min, max], n) => Math.min(max, Math.max(min, n));

// Dice icons: tap the third die for burst 3; tap the lit last die to drop one.
function DiceInput({value, max, min, onChange, color, label, zeroOption}) {
  const fill = color === 'active' ? 'var(--active)' : 'var(--reactive)';
  const dice = [];
  for (let i = 1; i <= max; i++) dice.push(i);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <span className="label">{label}</span>
      <div className="dice" role="group" aria-label={label}>
        {dice.map((n) => (
          <button type="button" key={n} className="die" aria-label={`${label} ${n}`} aria-pressed={n <= value}
            onClick={() => onChange(n === value ? Math.max(min, n - 1) : n)}>
            <D20 fill={n <= value ? fill : '#e8e6e1'} opacity={n <= value ? 1 : 0.25} />
          </button>
        ))}
        {zeroOption && (
          <button type="button" className="die" style={{marginLeft: 'auto', width: 44}} aria-pressed={value === 0}
            aria-label="Burst 0: no roll, the other side is unopposed" onClick={() => onChange(value === 0 ? 1 : 0)}>
            <D20 fill={value === 0 ? fill : '#6b6861'} crossed />
          </button>
        )}
      </div>
    </div>
  );
}

DiceInput.propTypes = {
  value: PropTypes.number.isRequired, max: PropTypes.number.isRequired, min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired, color: PropTypes.string.isRequired, label: PropTypes.string.isRequired,
  zeroOption: PropTypes.bool,
};

// −3 −1 [n] +1 +3: the steps that matter in Infinity (MODs come in threes).
function Stepper({name, value, limit, onChange, color}) {
  const step = (d) => onChange(clamp(limit, value + d));
  return (
    <div className="stepper">
      <span className="name">{name}</span>
      <button type="button" className="s" aria-label={`${name} minus 3`} onClick={() => step(-3)}>−3</button>
      <button type="button" className="s" aria-label={`${name} minus 1`} onClick={() => step(-1)}>−1</button>
      <span className={`v c-${color}`} aria-live="polite">{value}</span>
      <button type="button" className="s" aria-label={`${name} plus 1`} onClick={() => step(1)}>+1</button>
      <button type="button" className="s" aria-label={`${name} plus 3`} onClick={() => step(3)}>+3</button>
    </div>
  );
}

Stepper.propTypes = {
  name: PropTypes.string.isRequired, value: PropTypes.number.isRequired, limit: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired, color: PropTypes.string.isRequired,
};

function ClassicSide({side, params, setParam}) {
  const color = ROLE[side];
  const other = side === 'A' ? 'B' : 'A';
  const v = (k) => params[`${k}${side}`];
  const set = (k) => setParam(`${k}${side}`);
  const burst = v('burst');
  const ammo = v('ammo');
  const template = v('template');
  // A Direct Template hits automatically: no roll, so no Success Value.
  const rollsDice = burst !== 0 && !template;
  const causesSaves = burst !== 0 && ammo !== 'DODGE';
  const toggle = (k, name) => (
    <button type="button" className={`chip solid${v(k) ? ` on ${color}` : ''}`} aria-pressed={v(k)} onClick={() => set(k)(!v(k))}>
      {v(k) ? `${name} ✓` : name}
    </button>
  );

  return (
    <section className="card" aria-label={`${color} side`} style={{gap: 14}}>
      <span className={`role ${color}`}>{side === 'A' ? 'ACTIVE' : 'REACTIVE'}</span>
      <DiceInput label="Burst" value={burst} min={side === 'B' ? 0 : 1} max={6} color={color} onChange={set('burst')}
        zeroOption={side === 'B'} />
      <DiceInput label="Special dice" value={v('bonusBurst')} min={0} max={3} color={color} onChange={set('bonusBurst')} />
      <div className="steppers">
        {rollsDice && <Stepper name="Success Value" value={v('successValue')} limit={LIMITS.successValue} color={color} onChange={set('successValue')} />}
        {/* The save the opponent makes against this side: weapon PS + their ARM
            (cover included); Plasma also makes them save with BTS. */}
        {causesSaves && (
          <Stepper name={ammo === 'PLASMA' ? 'Opponent PS ARM' : 'Opponent PS'} value={v('damage') + params[`arm${other}`]}
            limit={SAVE_LIMIT.arm} color={color} onChange={(total) => dispatch({type: 'setClassicSave', side, which: 'arm', total})} />
        )}
        {causesSaves && ammo === 'PLASMA' && (
          <Stepper name="Opponent PS BTS" value={v('damage') + params[`bts${other}`]} limit={SAVE_LIMIT.bts} color={color}
            onChange={(total) => dispatch({type: 'setClassicSave', side, which: 'bts', total})} />
        )}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <span className="label">Ammunition</span>
        <div className="row-wrap">
          {AMMO.map(([key, name]) => (
            <button type="button" key={key} className={`btn solid${ammo === key ? ` on ${color}` : ''}`} aria-pressed={ammo === key}
              onClick={() => set('ammo')(key)}>{name}</button>
          ))}
          <button type="button" className={`btn solid${v('cont') ? ` on ${color}` : ''}`} aria-pressed={v('cont')}
            onClick={() => set('cont')(!v('cont'))} title="Continuous Damage">CONT</button>
        </div>
      </div>
      <div className="row-wrap">
        {toggle('critImmune', 'Immunity (Critical)')}
        {toggle('template', 'Direct Template')}
        {side === 'B' && (
          <button type="button" className={`chip solid${params.fixedFaceToFace ? ` on ${color}` : ''}`} aria-pressed={params.fixedFaceToFace}
            onClick={() => setParam('fixedFaceToFace')(!params.fixedFaceToFace)}>
            {params.fixedFaceToFace ? 'Fixed value die (AC2) ✓' : 'Fixed value die (AC2)'}
          </button>
        )}
      </div>
    </section>
  );
}

ClassicSide.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, params: PropTypes.object.isRequired, setParam: PropTypes.func.isRequired};

const setParam = (key) => (value) => dispatch({type: 'setClassic', key, value});

export default function ClassicScreen({params, engine}) {
  const summary = useMemo(() => {
    const s = summarize(engine.result);
    return s ? classicRollSummary(params, s) : null;
  }, [engine.result, params]);
  const save = useSaveRoll(summary);
  const layout = useLayout();
  if (layout === 'phone') {
    return (
      <>
        <main className="screen">
          <ClassicSide side="A" params={params} setParam={setParam} />
          <ClassicSide side="B" params={params} setParam={setParam} />
        </main>
        <ResultsCard result={engine.result} status={engine.status} classic save={save} />
      </>
    );
  }
  // Tablet: both sides next to each other, results below. Wider: active,
  // reactive and a results rail.
  return (
    <main className={`workbench classic ${layout}`}>
      <ClassicSide side="A" params={params} setParam={setParam} />
      <ClassicSide side="B" params={params} setParam={setParam} />
      <ResultsPanel result={engine.result} status={engine.status} classic save={save} />
    </main>
  );
}

ClassicScreen.propTypes = {params: PropTypes.object.isRequired, engine: PropTypes.object.isRequired};
