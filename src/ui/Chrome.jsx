// The app chrome behind the ⋯ button: the menu sheet, Settings, About and
// the toast (Saved rolls: SavedRolls.jsx). All of it reads the state document; each page is one
// overlay, so Back closes it.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {AUTO, LANGUAGES, browserLanguages, languageChoice, resolveLanguage} from '../state/language.js';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {MODES} from '../state/modes.js';
import {HEADLINES} from '../results/headline.js';
import {headlineChoice} from '../state/headlines.js';
import {Page, Sheet} from './Sheet.jsx';
import {Rich, useT} from './i18n.jsx';

/* global __APP_VERSION__, __ARMY_DATE__ */
export const VERSION = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__;
export const ARMY_DATE = typeof __ARMY_DATE__ === 'undefined' ? null : __ARMY_DATE__;

const back = () => dispatch({type: 'back'});
const open = (overlay) => dispatch({type: 'openOverlay', overlay});

export function Menu() {
  const t = useT();
  const mode = useAppState((s) => s.mode);
  const savedCount = useAppState((s) => s.lists.saved.length);
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => dispatch({type: 'setMode', mode: m})} aria-pressed={mode === m}>
      <span className="dot" style={{color: mode === m ? 'var(--active)' : 'var(--faint)'}}>{mode === m ? '●' : '○'}</span>
      <span style={{flexGrow: 1, color: mode === m ? 'var(--text)' : 'var(--text-2)'}}>{text}</span>
      {mode === m && <span className="note">{t('menu.opensNextTime')}</span>}
    </button>
  );
  return (
    <Sheet onClose={back} label={t('menu.menu')}>
      <nav aria-label={t('menu.appMenu')} style={{display: 'flex', flexDirection: 'column', margin: '-8px -8px 0'}}>
        <button type="button" className="menu-item" onClick={() => open('saved')}>
          <span className="menu-ic"><BookmarkIcon /></span><span style={{flexGrow: 1}}>{t('menu.savedRolls')}</span>
          <span className="note" style={{fontSize: 14}}>{savedCount || ''}</span>
        </button>
        <div className="menu-sep" />
        <span className="label" style={{padding: '10px 14px 4px'}}>{t('menu.calculator')}</span>
        {item(MODES.matchup, t('mode.matchup'))}
        {item(MODES.basic, t('menu.classicLong'))}
        <div className="menu-sep" />
        <button type="button" className="menu-item" onClick={() => open('settings')}>
          <span className="menu-ic"><GearIcon /></span><span>{t('settings.title')}</span>
        </button>
        <button type="button" className="menu-item" onClick={() => open('about')}>
          <span className="menu-ic"><InfoIcon /></span><span>{t('about.title')}</span>
        </button>
        <span className="note" style={{padding: '12px 14px 0', color: 'var(--faint)'}}>
          {ARMY_DATE ? `${t('about.armyData')} ${ARMY_DATE} · ` : ''}v{VERSION}
        </span>
      </nav>
    </Sheet>
  );
}

// Settings shared by the phone page and the desktop dialog (DeskMenu.jsx).
const confirmThen = (ask, action, done) => (t) => () => {
  if (window.confirm(t(ask))) { dispatch(action); dispatch({type: 'toast', text: t(done)}); }
};
export const clearRecents = confirmThen('settings.clearRecentsAsk', {type: 'clearRecents'}, 'settings.recentsCleared');
export const clearSaved = confirmThen('settings.deleteSavedAsk', {type: 'clearSaved'}, 'settings.savedDeleted');
export const setHeadline = (value) => dispatch({type: 'setPref', key: 'headline', value});

// The faction each side's picker starts on: "Last used" or a vanilla army.
export function StartFaction({side, label, factions, className}) {
  const t = useT();
  const start = useAppState((s) => s.prefs.startFaction) ?? {};
  const set = (value) => dispatch({type: 'setPref', key: 'startFaction', value: {...start, [side]: value === '' ? null : Number(value)}});
  return (
    <label className="setting">
      <span>{label}</span>
      <select className={className} value={start[side] ?? ''} onChange={(e) => set(e.target.value)}>
        <option value="">{t('settings.lastUsed')}</option>
        {factions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </label>
  );
}

StartFaction.propTypes = {side: PropTypes.string.isRequired, label: PropTypes.string.isRequired, factions: PropTypes.array.isRequired, className: PropTypes.string};

// Automatic follows the browser; the option says which language that is.
export function LanguageSetting() {
  const t = useT();
  const choice = useAppState((s) => languageChoice(s.prefs));
  const detected = LANGUAGES[resolveLanguage(AUTO, browserLanguages())];
  const set = (value) => dispatch({type: 'setPref', key: 'language', value: value === AUTO ? null : value});
  return (
    <>
      <label className="setting">
        <span>{t('settings.appLanguage')}</span>
        <select value={choice} onChange={(e) => set(e.target.value)}>
          <option value={AUTO}>{t('settings.automatic', {language: detected})}</option>
          {Object.entries(LANGUAGES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
    </>
  );
}

export function SettingsPage({factions}) {
  const t = useT();
  const prefs = useAppState((s) => s.prefs);
  return (
    <Page title={t('settings.title')} className="from-menu" onBack={back}>
      <div className="list-head" id="headline-head">{t('settings.resultsCard')}</div>
      <div role="radiogroup" aria-labelledby="headline-head">
        {HEADLINES.map((c) => (
          <label key={c} className="setting radio">
            <input type="radio" name="headline" value={c} checked={headlineChoice(prefs) === c}
              onChange={() => setHeadline(c)} />
            <span className="radio-text"><span>{t(`headline.${c}`)}</span><span className="note">{t(`headline.${c}Hint`)}</span></span>
          </label>
        ))}
      </div>
      <span className="note" style={{padding: '0 12px'}}>{t('settings.headlineNotePhone')}</span>
      <div className="list-head">{t('settings.startingFactions')}</div>
      <StartFaction side="A" label={t('settings.activeSide')} factions={factions} />
      <StartFaction side="B" label={t('settings.reactiveSide')} factions={factions} />
      <div className="list-head">{t('settings.language')}</div>
      <div className="lang-page"><LanguageSetting /></div>
      <div className="list-head">{t('settings.yourData')}</div>
      <button type="button" className="line-btn" onClick={clearRecents(t)}>
        <span>{t('settings.clearRecents')}</span>
      </button>
      <button type="button" className="line-btn" style={{color: 'var(--danger)'}}
        onClick={clearSaved(t)}>
        <span>{t('settings.deleteSaved')}</span>
      </button>
      <span className="note" style={{padding: '4px 12px'}}>{t('settings.savedOnDevice')}</span>
    </Page>
  );
}

SettingsPage.propTypes = {factions: PropTypes.array.isRequired};

// About text shared by the phone page and the desktop dialog.
const link = (href) => (text) => <a href={href}>{text}</a>;
export function AboutIntro() {
  const t = useT();
  return (
    <>
      <p>{t('about.intro')}</p>
      <p>{t('about.madeBy')}</p>
    </>
  );
}
export function AboutLinks() {
  const t = useT();
  return (
    <>
      <p>
        <Rich text={t('about.source')} tags={{a: link('https://github.com/alexrecarey/khepri-f2f')}} />
        {' · '}
        <Rich text={t('about.poweredBy')} tags={{a: link('https://github.com/HighDiceRoller/icepool'), b: link('https://github.com/HighDiceRoller')}} />
      </p>
      {/* The classic calculator is the pre-Matchup app, frozen on branch n5classic. */}
      <p>
        <Rich text={t('about.classic')} tags={{a: link('https://n5classic.infinitythecalculator.com')}} />
        {' · '}<a href="https://n4.infinitythecalculator.com">{t('about.n4')}</a>
      </p>
    </>
  );
}
export const CONTACT_EMAIL = 'khepri@infinitythecalculator.com';
export function AboutContact() {
  const t = useT();
  return <p><Rich text={t('about.contact', {email: CONTACT_EMAIL})} tags={{a: link(`mailto:${CONTACT_EMAIL}`)}} /></p>;
}

export function AboutPage() {
  const t = useT();
  return (
    <Page title={t('about.title')} className="from-menu" onBack={back}>
      <div className="about">
        <span className="about-title">Infinity the Calculator</span>
        <AboutIntro />
        <AboutContact />
        <AboutLinks />
        <p>{t('about.trademark')}</p>
        <p className="small-print">
          {t('about.armyDataSnapshot', {date: ARMY_DATE ? ` · ${ARMY_DATE}` : ''})}<br />
          {t('about.rules')}: N5<br />
          {t('about.app')}: v{VERSION}
        </p>
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
