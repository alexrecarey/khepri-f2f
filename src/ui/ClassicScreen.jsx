// The classic calculator: type the final numbers yourself. Same inputs and
// the same hiding rules as before (src/CalculatorColumn.jsx), in the new design.
// The numbers are the state document's classic slice.
import {useCallback} from 'react';
import PropTypes from 'prop-types';
import {LIMITS} from '../engine/params.js';
import {clamp} from '../lib/clamp.js';
import {CLASSIC_AMMO, SAVE_LIMIT, armSave, btsSave, classicSide} from '../state/classicView.js';
import {ROLE} from '../state/schema.js';
import {dispatch} from '../state/store.js';
import {D20} from './icons.jsx';
import ResultsCard from './ResultsCard.jsx';
import ResultsPanel from './ResultsPanel.jsx';
import useLayout from './useLayout.js';
import {classicRollSummary} from '../state/rolls.js';
import useRollResults from './useRollResults.js';
import {engineStatus, useT} from './i18n.jsx';
import {sideLabel} from './SideCard.jsx';

// Dice icons: tap the third die for burst 3; tap the lit last die to drop one.
/** @typedef {import('../types.js').Params} Params */
/** @typedef {import('../types.js').Side} Side */

/** @param {{value: number, max: number, min: number, onChange: (n: number) => void, color: string, label: string, zeroOption?: boolean}} props */
function DiceInput({value, max, min, onChange, color, label, zeroOption}) {
  const t = useT();
  const fill = color === 'active' ? 'var(--active)' : 'var(--reactive)';
  const dice = [];
  for (let i = 1; i <= max; i++) dice.push(i);
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="dice" role="group" aria-label={label}>
        {dice.map((n) => (
          <button type="button" key={n} className="die" aria-label={`${label} ${n}`} aria-pressed={n <= value}
            onClick={() => onChange(n === value ? Math.max(min, n - 1) : n)}>
            {/* Keyed on lit/unlit, so a die tumbles in when it lights up. */}
            <span key={n <= value ? 'lit' : 'off'} className={`die-face ${n <= value ? 'tumble' : 'fade-in'}`}>
              <D20 fill={n <= value ? fill : 'var(--text)'} opacity={n <= value ? 1 : 0.25} />
            </span>
          </button>
        ))}
        {zeroOption && (
          <button type="button" className="die zero" aria-pressed={value === 0}
            aria-label={t('classic.burstZero')} onClick={() => onChange(value === 0 ? 1 : 0)}>
            <D20 fill={value === 0 ? fill : 'var(--faint)'} crossed />
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
/** @param {{name: string, value: number, limit: readonly [number, number], onChange: (n: number) => void, color: string}} props */
function Stepper({name, value, limit, onChange, color}) {
  const t = useT();
  /** @param {number} d */
  const step = (d) => onChange(clamp(limit, value + d));
  return (
    <div className="stepper">
      <span className="name">{name}</span>
      <button type="button" className="s" aria-label={t('classic.minus', {name, n: 3})} onClick={() => step(-3)}>−3</button>
      <button type="button" className="s" aria-label={t('classic.minus', {name, n: 1})} onClick={() => step(-1)}>−1</button>
      <span key={value} className={`v c-${color} bump`} aria-live="polite">{value}</span>
      <button type="button" className="s" aria-label={t('classic.plus', {name, n: 1})} onClick={() => step(1)}>+1</button>
      <button type="button" className="s" aria-label={t('classic.plus', {name, n: 3})} onClick={() => step(3)}>+3</button>
    </div>
  );
}

Stepper.propTypes = {
  name: PropTypes.string.isRequired, value: PropTypes.number.isRequired, limit: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired, color: PropTypes.string.isRequired,
};

/** The per-side params, without the side letter.
 * @typedef {'burst' | 'bonusBurst' | 'successValue' | 'ammo' | 'cont' | 'critImmune' | 'template'} SideKey */

/** @param {{side: Side, params: Params, setParam: (key: keyof Params) => (value: Params[keyof Params]) => void}} props */
function ClassicSide({side, params, setParam}) {
  const t = useT();
  const color = ROLE[side];
  /** @param {SideKey} k */
  const v = (k) => params[`${k}${side}`];
  /** @param {SideKey} k */
  const set = (k) => setParam(`${k}${side}`);
  const burst = /** @type {number} */ (v('burst'));
  const ammo = v('ammo');
  const {rollsDice, causesSaves, plasma} = classicSide(params, side);
  /**
   * @param {'critImmune' | 'template'} k
   * @param {string} name
   */
  const toggle = (k, name) => (
    <button type="button" className={`chip solid${v(k) ? ` on ${color}` : ''}`} aria-pressed={/** @type {boolean} */ (v(k))} onClick={() => set(k)(!v(k))}>
      {v(k) ? `${name} ✓` : name}
    </button>
  );

  return (
    <section className="card classic-side" aria-label={t('classic.side', {side: t(`side.${color}`)})}>
      <span className={`role ${color}`}>{sideLabel(t, side)}</span>
      <DiceInput label={t('classic.burst')} value={burst} min={side === 'B' ? 0 : 1} max={6} color={color} onChange={set('burst')}
        zeroOption={side === 'B'} />
      <DiceInput label={t('classic.specialDice')} value={/** @type {number} */ (v('bonusBurst'))} min={0} max={3} color={color} onChange={set('bonusBurst')} />
      <div className="steppers">
        {rollsDice && <Stepper name={t('classic.successValue')} value={/** @type {number} */ (v('successValue'))} limit={LIMITS.successValue} color={color} onChange={set('successValue')} />}
        {/* The save the opponent makes against this side: weapon PS + their ARM
            (cover included); Plasma also makes them save with BTS. */}
        {causesSaves && (
          <Stepper name={plasma ? t('classic.opponentPsArm') : t('classic.opponentPs')} value={armSave(params, side)}
            limit={SAVE_LIMIT.arm} color={color} onChange={(total) => dispatch({type: 'setClassicSave', side, which: 'arm', total})} />
        )}
        {causesSaves && plasma && (
          <Stepper name={t('classic.opponentPsBts')} value={btsSave(params, side)} limit={SAVE_LIMIT.bts} color={color}
            onChange={(total) => dispatch({type: 'setClassicSave', side, which: 'bts', total})} />
        )}
      </div>
      <div className="field">
        <span className="label">{t('classic.ammunition')}</span>
        <div className="row-wrap">
          {CLASSIC_AMMO.map(([key, name]) => (
            <button type="button" key={key} className={`btn solid${ammo === key ? ` on ${color}` : ''}`} aria-pressed={ammo === key}
              onClick={() => set('ammo')(key)}>{t(name)}</button>
          ))}
          <button type="button" className={`btn solid${v('cont') ? ` on ${color}` : ''}`} aria-pressed={/** @type {boolean} */ (v('cont'))}
            onClick={() => set('cont')(!v('cont'))} title={t('trait.continuousDamage')}>{t('tag.contUpper')}</button>
        </div>
      </div>
      <div className="row-wrap">
        {toggle('critImmune', t('classic.critImmune'))}
        {toggle('template', t('classic.directTemplate'))}
        {side === 'B' && (
          <button type="button" className={`chip solid${params.fixedFaceToFace ? ` on ${color}` : ''}`} aria-pressed={params.fixedFaceToFace}
            onClick={() => setParam('fixedFaceToFace')(!params.fixedFaceToFace)}>
            {params.fixedFaceToFace ? `${t('classic.fixedDie')} ✓` : t('classic.fixedDie')}
          </button>
        )}
      </div>
    </section>
  );
}

ClassicSide.propTypes = {side: PropTypes.oneOf(['A', 'B']).isRequired, params: PropTypes.object.isRequired, setParam: PropTypes.func.isRequired};

/** @param {keyof Params} key */
const setParam = (key) => /** @param {Params[keyof Params]} value */ (value) => dispatch({type: 'setClassic', key, value});

/** @param {{params: Params, engine: import('../types.js').EngineHook}} props */
export default function ClassicScreen({params, engine}) {
  const t = useT();
  const summaryOf = useCallback(/** @param {import('../types.js').Summary} s */ (s) => classicRollSummary(params, s, t), [params, t]);
  const status = engineStatus(t, engine.status);
  const {s, save} = useRollResults({result: engine.result, summaryOf, pending: engine.pending});
  const layout = useLayout();
  if (layout === 'phone') {
    return (
      <>
        <main className="screen">
          <ClassicSide side="A" params={params} setParam={setParam} />
          <ClassicSide side="B" params={params} setParam={setParam} />
        </main>
        <ResultsCard s={s} status={status} pending={engine.pending} classic save={save} params={params} />
      </>
    );
  }
  // Tablet: both sides next to each other, results below. Wider: active,
  // reactive and a results rail.
  return (
    <main className={`workbench classic ${layout}`}>
      <ClassicSide side="A" params={params} setParam={setParam} />
      <ClassicSide side="B" params={params} setParam={setParam} />
      <ResultsPanel s={s} status={status} pending={engine.pending} classic save={save} params={params} />
    </main>
  );
}

ClassicScreen.propTypes = {params: PropTypes.object.isRequired, engine: PropTypes.object.isRequired};
