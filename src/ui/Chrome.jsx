// The app chrome behind the ⋯ button: the menu sheet, Settings, About and
// the toast (Saved rolls: SavedRolls.jsx). All of it reads the state document; each page is one
// overlay, so Back closes it.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {MODES} from '../state/modes.js';
import {HEADLINES, HEADLINE_HINTS, HEADLINE_NAMES, headlineChoice} from './headline.js';
import {Page, Sheet} from './Sheet.jsx';

/* global __APP_VERSION__, __ARMY_DATE__ */
export const VERSION = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__;
export const ARMY_DATE = typeof __ARMY_DATE__ === 'undefined' ? null : __ARMY_DATE__;

const back = () => dispatch({type: 'back'});
const open = (overlay) => dispatch({type: 'openOverlay', overlay});

export function Menu() {
  const mode = useAppState((s) => s.mode);
  const savedCount = useAppState((s) => s.lists.saved.length);
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => dispatch({type: 'setMode', mode: m})} aria-pressed={mode === m}>
      <span className="dot" style={{color: mode === m ? 'var(--active)' : 'var(--faint)'}}>{mode === m ? '●' : '○'}</span>
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

// Settings shared by the phone page and the desktop dialog (DeskMenu.jsx).
const confirmThen = (text, action, done) => () => {
  if (window.confirm(text)) { dispatch(action); dispatch({type: 'toast', text: done}); }
};
export const clearRecents = confirmThen('Clear recent troopers and factions?', {type: 'clearRecents'}, 'Recents cleared');
export const clearSaved = confirmThen('Delete every saved roll? This cannot be undone.', {type: 'clearSaved'}, 'Saved rolls deleted');
export const setHeadline = (value) => dispatch({type: 'setPref', key: 'headline', value});

// The faction each side's picker starts on: "Last used" or a vanilla army.
export function StartFaction({side, label, factions, className}) {
  const start = useAppState((s) => s.prefs.startFaction) ?? {};
  const set = (value) => dispatch({type: 'setPref', key: 'startFaction', value: {...start, [side]: value === '' ? null : Number(value)}});
  return (
    <label className="setting">
      <span>{label}</span>
      <select className={className} value={start[side] ?? ''} onChange={(e) => set(e.target.value)}>
        <option value="">Last used</option>
        {factions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </label>
  );
}

StartFaction.propTypes = {side: PropTypes.string.isRequired, label: PropTypes.string.isRequired, factions: PropTypes.array.isRequired, className: PropTypes.string};

export function LanguageSetting() {
  return (
    <>
      <label className="setting">
        <span>App language</span>
        <select value="en" onChange={() => {}} disabled><option value="en">English</option></select>
      </label>
      <span className="note">More languages are on the way.</span>
    </>
  );
}

export function SettingsPage({factions}) {
  const prefs = useAppState((s) => s.prefs);
  return (
    <Page title="Settings" className="from-menu" onBack={back}>
      <div className="list-head" id="headline-head">Results card</div>
      <div role="radiogroup" aria-labelledby="headline-head">
        {HEADLINES.map((c) => (
          <label key={c} className="setting radio">
            <input type="radio" name="headline" value={c} checked={headlineChoice(prefs) === c}
              onChange={() => setHeadline(c)} />
            <span className="radio-text"><span>{HEADLINE_NAMES[c]}</span><span className="note">{HEADLINE_HINTS[c]}</span></span>
          </label>
        ))}
      </div>
      <span className="note" style={{padding: '0 12px'}}>The big number on the results card; swipe the card sideways to change it there. The others are one swipe up.</span>
      <div className="list-head">Starting factions</div>
      <StartFaction side="A" label="Active side" factions={factions} />
      <StartFaction side="B" label="Reactive side" factions={factions} />
      <div className="list-head">Language</div>
      <div className="lang-page"><LanguageSetting /></div>
      <div className="list-head">Your data</div>
      <button type="button" className="line-btn" onClick={clearRecents}>
        <span>Clear recent troopers</span>
      </button>
      <button type="button" className="line-btn" style={{color: 'var(--danger)'}}
        onClick={clearSaved}>
        <span>Delete all saved rolls</span>
      </button>
      <span className="note" style={{padding: '4px 12px'}}>Saved rolls live only on this device.</span>
    </Page>
  );
}

SettingsPage.propTypes = {factions: PropTypes.array.isRequired};

// About text shared by the phone page and the desktop dialog.
export const AboutIntro = () => (
  <>
    <p>Face-to-face odds for Infinity N5. Pick two troopers, set the situation, see every modifier and the dice that get rolled.</p>
    <p>Odds are exact: every possible roll is counted, not simulated.</p>
  </>
);
export const AboutLinks = () => (
  <p>
    <a href="https://github.com/alexrecarey/khepri-f2f">Source on GitHub</a>
    {' · '}Powered by <a href="https://github.com/HighDiceRoller/icepool">icepool</a>
    {' · '}<a href="https://n4.infinitythecalculator.com">N4 calculator</a>
  </p>
);
export const MADE_BY = 'Made with ❤️ for the Infinity community by Khepri and Bebop.';
export const TRADEMARK = 'Infinity is a trademark of Corvus Belli. This is a fan-made tool, not affiliated with Corvus Belli.';

export function AboutPage() {
  return (
    <Page title="About" className="from-menu" onBack={back}>
      <div className="about">
        <span className="about-title">Infinity the Calculator</span>
        <AboutIntro />
        <p className="small-print">
          Army data: Corvus Belli&apos;s Infinity Army{ARMY_DATE ? ` · ${ARMY_DATE}` : ''} (unofficial snapshot)<br />
          Rules: N5<br />
          App: v{VERSION}
        </p>
        <p>{MADE_BY}</p>
        <AboutLinks />
        <p className="small-print">{TRADEMARK}</p>
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
