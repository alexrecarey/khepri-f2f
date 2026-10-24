// The app chrome behind the ⋯ button: the menu sheet and the toast. Settings
// and About are their own pages (SettingsPage.jsx, AboutPage.jsx; Saved
// rolls: SavedRolls.jsx). All of it reads the state document; each page is
// one overlay, so Back closes it.
import {useEffect} from 'react';
import {dispatch, useAppState} from '../state/store.js';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {MODES} from '../state/modes.js';
import {ARMY_DATE, VERSION} from './AboutPage.jsx';
import {Sheet} from './Sheet.jsx';
import {useT} from './i18n.jsx';

const back = () => dispatch({type: 'back'});
/** @param {NonNullable<import('../types.js').UiState['overlay']>} overlay */
const open = (overlay) => dispatch({type: 'openOverlay', overlay});

export function Menu() {
  const t = useT();
  const mode = useAppState((s) => s.mode);
  const savedCount = useAppState((s) => s.lists.saved.length);
  /**
   * @param {string} m
   * @param {string} text
   */
  const item = (m, text) => (
    <button type="button" className="menu-item" onClick={() => dispatch({type: 'setMode', mode: m})} aria-pressed={mode === m}>
      <span className="dot">{mode === m ? '●' : '○'}</span>
      <span className="menu-text">{text}</span>
      {mode === m && <span className="note">{t('menu.opensNextTime')}</span>}
    </button>
  );
  return (
    <Sheet onClose={back} label={t('menu.menu')}>
      <nav className="menu-nav" aria-label={t('menu.appMenu')}>
        <button type="button" className="menu-item" onClick={() => open('saved')}>
          <span className="menu-ic"><BookmarkIcon /></span><span className="menu-text">{t('menu.savedRolls')}</span>
          <span className="note menu-count">{savedCount || ''}</span>
        </button>
        <div className="menu-sep" />
        <span className="label menu-section-label">{t('menu.calculator')}</span>
        {item(MODES.matchup, t('mode.matchup'))}
        {item(MODES.basic, t('menu.classicLong'))}
        <div className="menu-sep" />
        <button type="button" className="menu-item" onClick={() => open('settings')}>
          <span className="menu-ic"><GearIcon /></span><span>{t('settings.title')}</span>
        </button>
        <button type="button" className="menu-item" onClick={() => open('about')}>
          <span className="menu-ic"><InfoIcon /></span><span>{t('about.title')}</span>
        </button>
        <span className="note menu-version">
          {ARMY_DATE ? `${t('about.armyData')} ${ARMY_DATE} · ` : ''}v{VERSION}
        </span>
      </nav>
    </Sheet>
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
