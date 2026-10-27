// The Settings page behind the ⋯ menu (phone; one overlay, so Back closes
// it), and the settings the desktop dialog (DeskMenu.jsx) shares with it.
import PropTypes from 'prop-types';
import {AUTO, LANGUAGES, browserLanguages, languageChoice, resolveLanguage} from '../state/language.js';
import {dispatch, useAppState} from '../state/store.js';
import {HEADLINES} from '../results/headline.js';
import {headlineChoice, setHeadline} from '../state/headlines.js';
import {Page} from './Sheet.jsx';
import {useT} from './i18n.jsx';
import {back} from './nav.js';

// Settings shared by the phone page and the desktop dialog (DeskMenu.jsx).
/**
 * @param {string} ask
 * @param {import('../types.js').Action} action
 * @param {string} done
 */
const confirmThen = (ask, action, done) => /** @param {import('../types.js').Translator} t */ (t) => () => {
  if (window.confirm(t(ask))) { dispatch(action); dispatch({type: 'toast', text: t(done)}); }
};
export const clearRecents = confirmThen('settings.clearRecentsAsk', {type: 'clearRecents'}, 'settings.recentsCleared');
export const clearSaved = confirmThen('settings.deleteSavedAsk', {type: 'clearSaved'}, 'settings.savedDeleted');

// The faction each side's picker starts on: "Last used" or a vanilla army.
/** @param {{side: import('../types.js').Side, label: string, factions: {id: number, name: string}[], className?: string}} props */
export function StartFaction({side, label, factions, className}) {
  const t = useT();
  const start = useAppState((s) => s.prefs.startFaction) ?? {};
  /** @param {string} value */
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
  /** @param {string} value */
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

/** @param {{factions: {id: number, name: string}[]}} props */
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
              onChange={() => dispatch(setHeadline(c))} />
            <span className="radio-text"><span>{t(`headline.${c}`)}</span><span className="note">{t(`headline.${c}Hint`)}</span></span>
          </label>
        ))}
      </div>
      <span className="note settings-note">{t('settings.headlineNotePhone')}</span>
      <div className="list-head">{t('settings.startingFactions')}</div>
      <StartFaction side="A" label={t('settings.activeSide')} factions={factions} />
      <StartFaction side="B" label={t('settings.reactiveSide')} factions={factions} />
      <div className="list-head">{t('settings.language')}</div>
      <div className="lang-page"><LanguageSetting /></div>
      <div className="list-head">{t('settings.yourData')}</div>
      <button type="button" className="line-btn" onClick={clearRecents(t)}>
        <span>{t('settings.clearRecents')}</span>
      </button>
      <button type="button" className="line-btn danger" onClick={clearSaved(t)}>
        <span>{t('settings.deleteSaved')}</span>
      </button>
      <span className="note settings-note foot">{t('settings.savedOnDevice')}</span>
    </Page>
  );
}

SettingsPage.propTypes = {factions: PropTypes.array.isRequired};
