// A loadout in the desk picker's unit pane, as weapon chart lines.
import {bandColor} from '../bands.js';
import {ammoName} from '../../army/weapons.js';
import {useT} from '../i18n.jsx';
import {loadoutCharts} from '../../state/pickerView.js';
import {setCursor} from './useDeskPicker.js';

/** @typedef {import('../../state/pickerView.js').WeaponChart} WeaponChart */

/** @param {{bands: (number | null)[]}} props */
function Stripe({bands}) {
  return (
    <span className="stripe7" aria-hidden="true">{bands.map((m, i) => <i key={i} style={{background: bandColor(m)}} />)}</span>
  );
}

// c.ammo: English tokens joined by +, or 'template'.
/** @param {{c: WeaponChart, sub?: boolean}} props */
function ChartLine({c, sub}) {
  const t = useT();
  const ammo = c.ammo === 'template' ? t('ledger.template') : c.ammo.split('+').filter(Boolean).map((a) => ammoName(a, t)).join('+');
  return (
    <div className={`chart-line${sub ? ' sub' : ''}`}>
      <span className="n">{c.name}</span>
      <Stripe bands={c.bands} />
      <span className="m">{c.burst != null ? `${t('abbr.B')}${c.burst}` : ''}</span>
      <span className="m">{c.ps != null ? `${t('abbr.PS')}${c.ps}` : ''}</span>
      <span className="a">{ammo}</span>
    </div>
  );
}

// One loadout as chart lines: its main gun (with `tag`), the rest once it is
// the lit one, then points and SWC. i is its place in the pane's loadouts,
// which the arrow keys walk.
/** @param {{h: import('../../types.js').ProfileHit, i: number, tag?: string | null, on?: boolean, color: string, army: import('../../types.js').Army | null, onPick: (hit: import('../../types.js').ProfileHit) => void}} props */
export default function DeskLoadout({h, i, tag, on, color, army, onPick}) {
  const t = useT();
  const charts = loadoutCharts(army, h.weaponIds);
  const main = charts[0];
  return (
    <div id={`dp-lo-${i}`} role="option" aria-selected={on} className={`dp-loadout${on ? ` on ${color}` : ''}`}
      onClick={() => setCursor({pane: 'loadouts', lcursor: i})} onDoubleClick={() => onPick(h)}>
      {/* A peripheral with no weapon (Cutters' Crabbot) is named by its loadout. */}
      {main ? <ChartLine c={{...main, name: `${main.name}${tag ? ` · ${tag}` : ''}`}} /> : <span>{h.weapons.join(', ') || h.loadout}{tag ? ` · ${tag}` : ''}</span>}
      {on && charts.slice(1).map((c) => <ChartLine key={c.id} c={c} sub />)}
      <span className="pts">{h.points} {t('picker.pts')}{h.swc ? ` · ${h.swc} ${t('picker.swc')}` : ''}</span>
    </div>
  );
}
