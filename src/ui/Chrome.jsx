// The app chrome behind the ⋯ button: the menu sheet, Saved rolls, Settings,
// About, and the toast. All of it reads the state document; each page is one
// overlay, so Back closes it.
import {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {MODES} from './modes.js';
import {Page, Sheet} from './Sheet.jsx';

/* global __APP_VERSION__, __ARMY_DATE__ */
const VERSION = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__;
const ARMY_DATE = typeof __ARMY_DATE__ === 'undefined' ? null : __ARMY_DATE__;

const back = () => dispatch({type: 'back'});
const open = (overlay) => dispatch({type: 'openOverlay', overlay});

export function Menu() {
  const mode = useAppState((s) => s.mode);
  const savedCount = useAppState((s) => s.lists.saved.length);
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => dispatch({type: 'setMode', mode: m})} aria-pressed={mode === m}>
      <span className="dot" style={{color: mode === m ? 'var(--active)' : '#555'}}>{mode === m ? '●' : '○'}</span>
      <span style={{flexGrow: 1, color: mode === m ? 'var(--text)' : 'var(--text-2)'}}>{text}</span>
      {mode === m && <span className="note">opens next time</span>}
    </button>
  );
  return (
    <Sheet onClose={back} label="Menu">
      <nav aria-label="App menu" style={{display: 'flex', flexDirection: 'column', margin: '-8px -8px 0'}}>
        <button type="button" className="menu-item" onClick={() => open('saved')}>
          <span className="menu-ic"><BookmarkIcon /></span><span style={{flexGrow: 1}}>Saved rolls</span>
          <span className="note" style={{fontSize: 14}}>{savedCount || ''}</span>
        </button>
        <div className="menu-sep" />
        <span className="label" style={{padding: '10px 14px 4px'}}>Calculator</span>
        {item(MODES.matchup, 'Matchup')}
        {item(MODES.basic, 'Classic — type the numbers')}
        <div className="menu-sep" />
        <button type="button" className="menu-item" onClick={() => open('settings')}>
          <span className="menu-ic"><GearIcon /></span><span>Settings</span>
        </button>
        <button type="button" className="menu-item" onClick={() => open('about')}>
          <span className="menu-ic"><InfoIcon /></span><span>About</span>
        </button>
        <span className="note" style={{padding: '12px 14px 0', color: 'var(--faint)'}}>
          {ARMY_DATE ? `Army data ${ARMY_DATE} · ` : ''}v{VERSION}
        </span>
      </nav>
    </Sheet>
  );
}

// One saved roll; swipe it left to show Delete.
function RollCard({roll, swiped}) {
  const {summary: s} = roll;
  const drag = useRef(null);
  const cardRef = useRef(null);
  const OPEN = -88;
  const setX = (x) => { if (cardRef.current) cardRef.current.style.transform = x ? `translateX(${x}px)` : ''; };
  useEffect(() => setX(swiped ? OPEN : 0), [swiped]);
  const onDown = (e) => { drag.current = {x0: e.clientX, y0: e.clientY, base: swiped ? OPEN : 0, moved: false}; };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 8) return;
    if (!d.moved && Math.abs(e.clientY - d.y0) > Math.abs(dx)) { drag.current = null; return; }
    d.moved = true;
    setX(Math.min(0, Math.max(OPEN * 1.5, d.base + dx)));
  };
  const onUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const x = d.base + e.clientX - d.x0;
    const isOpen = x < OPEN / 2;
    setX(isOpen ? OPEN : 0);
    dispatch({type: 'setSwiped', id: isOpen ? roll.id : null});
    e.preventDefault();
  };
  const onClick = (e) => {
    if (swiped) { e.preventDefault(); dispatch({type: 'setSwiped', id: null}); return; }
    dispatch({type: 'loadRoll', id: roll.id});
  };
  return (
    <div className="roll-wrap">
      <button type="button" className="roll-delete" tabIndex={swiped ? 0 : -1}
        onClick={() => { dispatch({type: 'deleteRoll', id: roll.id}); dispatch({type: 'toast', text: 'Roll deleted'}); }}>Delete</button>
      <button type="button" ref={cardRef} className="roll" onClick={onClick}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; setX(swiped ? OPEN : 0); }}
        onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') dispatch({type: 'deleteRoll', id: roll.id}); }}
        aria-label={`${s.a} against ${s.r}, ${s.setup}. Load this roll`}>
        <span className="roll-row" style={{fontWeight: 600}}><span className="c-active">{s.a}</span><span className="c-reactive">{s.r}</span></span>
        <span className="roll-row dice"><span className="c-active">{s.ad}</span><span className="c-reactive">{s.rd}</span></span>
        <span className="roll-row note"><span>{s.setup}</span><span><b className="c-active">{s.ap}</b> · <b className="c-reactive">{s.rp}</b></span></span>
      </button>
    </div>
  );
}

RollCard.propTypes = {roll: PropTypes.object.isRequired, swiped: PropTypes.bool};

export function SavedPage() {
  const saved = useAppState((s) => s.lists.saved);
  const mode = useAppState((s) => s.mode);
  const tab = useAppState((s) => s.ui.savedTab) ?? mode;
  const swiped = useAppState((s) => s.ui.swiped);
  const count = (m) => saved.filter((r) => r.mode === m).length;
  const list = saved.filter((r) => r.mode === tab);
  const tabBtn = (m, name) => (
    <button type="button" className={`seg${tab === m ? ' on' : ''}`} aria-pressed={tab === m}
      onClick={() => dispatch({type: 'setSavedTab', tab: m})}>{name} · {count(m)}</button>
  );
  return (
    <Page title="Saved rolls" onBack={back} action={<span className="note" style={{paddingRight: 12, fontSize: 13}}>{saved.length}</span>}>
      <div className="segs" role="group" aria-label="Which calculator">
        {tabBtn(MODES.matchup, 'Matchup')}
        {tabBtn(MODES.basic, 'Classic')}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 4px'}}>
        {list.map((r) => <RollCard key={r.id} roll={r} swiped={swiped === r.id} />)}
        {list.length > 0
          ? <span className="note" style={{textAlign: 'center', padding: 8, color: 'var(--faint)'}}>Tap to load the whole setup · swipe left to delete</span>
          : <span className="empty">Nothing saved yet. Open the results and tap Save to keep a roll here.</span>}
      </div>
    </Page>
  );
}

export function SettingsPage({factions}) {
  const prefs = useAppState((s) => s.prefs);
  const start = prefs.startFaction ?? {};
  const setStart = (side, value) => dispatch({type: 'setPref', key: 'startFaction', value: {...start, [side]: value === '' ? null : Number(value)}});
  const select = (side, label) => (
    <label className="setting">
      <span>{label}</span>
      <select value={start[side] ?? ''} onChange={(e) => setStart(side, e.target.value)}>
        <option value="">Last used</option>
        {factions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </label>
  );
  const confirmThen = (text, action, done) => () => {
    if (window.confirm(text)) { dispatch(action); dispatch({type: 'toast', text: done}); }
  };
  return (
    <Page title="Settings" onBack={back}>
      <div className="list-head">Starting factions</div>
      {select('A', 'Active side')}
      {select('B', 'Reactive side')}
      <div className="list-head">Language</div>
      <label className="setting">
        <span>App language</span>
        <select value="en" onChange={() => {}} disabled><option value="en">English</option></select>
      </label>
      <span className="note" style={{padding: '0 12px'}}>More languages are on the way.</span>
      <div className="list-head">Your data</div>
      <button type="button" className="line-btn" onClick={confirmThen('Clear recent troopers and factions?', {type: 'clearRecents'}, 'Recents cleared')}>
        <span>Clear recent troopers</span>
      </button>
      <button type="button" className="line-btn" style={{color: 'var(--danger)'}}
        onClick={confirmThen('Delete every saved roll? This cannot be undone.', {type: 'clearSaved'}, 'Saved rolls deleted')}>
        <span>Delete all saved rolls</span>
      </button>
      <span className="note" style={{padding: '4px 12px'}}>Saved rolls live only on this device.</span>
    </Page>
  );
}

SettingsPage.propTypes = {factions: PropTypes.array.isRequired};

export function AboutPage() {
  return (
    <Page title="About" onBack={back}>
      <div className="about">
        <span className="about-title">Infinity the Calculator</span>
        <p>Face-to-face odds for Infinity N5. Pick two troopers, set the situation, see every modifier and the dice that get rolled.</p>
        <p>Odds are exact: every possible roll is counted, not simulated.</p>
        <p className="small-print">
          Army data: Corvus Belli&apos;s Infinity Army{ARMY_DATE ? ` · ${ARMY_DATE}` : ''} (unofficial snapshot)<br />
          Rules: N5<br />
          App: v{VERSION}
        </p>
        <p>Made with ❤️ for the Infinity community by Khepri and Bebop.</p>
        <p>
          <a href="https://github.com/alexrecarey/khepri-f2f">Source on GitHub</a>
          {' · '}Powered by <a href="https://github.com/HighDiceRoller/icepool">icepool</a>
          {' · '}<a href="https://n4.infinitythecalculator.com">N4 calculator</a>
        </p>
        <p className="small-print">Infinity is a trademark of Corvus Belli. This is a fan-made tool, not affiliated with Corvus Belli.</p>
      </div>
    </Page>
  );
}

// A short message at the bottom for a moment, then gone.
export function Toast() {
  const toast = useAppState((s) => s.ui.toast);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch({type: 'toast', text: null}), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  return toast ? <div className="toast" role="status">{toast.text}</div> : null;
}
