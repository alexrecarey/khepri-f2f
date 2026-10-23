// The menu on wide screens (design canvas Final: "Desktop menu — header
// buttons (A)"): Saved, Settings and About sit in the header and each opens a
// centred dialog (DeskDialog.jsx); the open one's button stays pressed. The
// phone keeps the ⋯ menu sheet and full-screen pages (Chrome.jsx).
import {useMemo} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {
  ARMY_DATE, AboutContact, AboutIntro, AboutLinks, LanguageSetting, StartFaction, VERSION,
  clearRecents, clearSaved, setHeadline,
} from './Chrome.jsx';
import DeskDialog from './DeskDialog.jsx';
import {HEADLINES, headline} from '../results/headline.js';
import {headlineChoice} from '../state/headlines.js';
import {useT} from './i18n.jsx';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {summarize} from '../results/summary.js';

// A second click on the open page's button closes it.
const toggle = (overlay, open) => dispatch(open ? {type: 'back'} : {type: 'openOverlay', overlay});

export function HeaderButtons() {
  const t = useT();
  const overlay = useAppState((s) => s.ui.overlay);
  const savedCount = useAppState((s) => s.lists.saved.length);
  // name: the overlay; label: the button's text, or null for an icon named `aria`.
  const button = (name, label, icon, extra, aria) => (
    <button type="button" className={`hdr-btn${label ? '' : ' icon'}`} aria-pressed={overlay === name}
      aria-label={label ? undefined : aria} onClick={() => toggle(name, overlay === name)}>
      {icon}{label}{extra}
    </button>
  );
  return (
    <span className="hdr-btns">
      {button('saved', t('menu.saved'), <BookmarkIcon />, savedCount > 0 && <span className="n">{savedCount}</span>)}
      {button('settings', t('settings.title'), <GearIcon />)}
      {button('about', null, <InfoIcon />, null, t('about.title'))}
    </span>
  );
}

// results: {result, targets, params} of the roll on screen, so each choice
// shows what the card would read with it (the active side's number).
export function SettingsDialog({factions, results}) {
  const t = useT();
  const choice = useAppState((s) => headlineChoice(s.prefs));
  const s = useMemo(() => summarize(results.result, results.targets), [results.result, results.targets]);
  return (
    <DeskDialog title={t('settings.title')} size="settings">
      <div className="ds-body">
        <div className="ds-group">
          <span className="label" id="ds-headline">{t('settings.resultsCard')}</span>
          <div className="ds-choices" role="radiogroup" aria-labelledby="ds-headline">
            {HEADLINES.map((c) => (
              <label key={c} className="ds-choice">
                <input type="radio" name="headline" value={c} checked={choice === c} onChange={() => setHeadline(c)} />
                <span className="radio-text"><span>{t(`headline.${c}`)}</span><span className="note">{t(`headline.${c}Hint`)}</span></span>
                {s && <span className="val">{headline(s, c, results.params, null, t).text.active}</span>}
              </label>
            ))}
          </div>
          <span className="note">{t('settings.headlineNoteDesk')}</span>
        </div>
        <div className="ds-col">
          <div className="ds-group">
            <span className="label">{t('settings.startingFactions')}</span>
            <StartFaction side="A" label={t('settings.activeSide')} factions={factions} className="c-active" />
            <StartFaction side="B" label={t('settings.reactiveSide')} factions={factions} className="c-reactive" />
          </div>
          <div className="ds-group">
            <span className="label">{t('settings.language')}</span>
            <LanguageSetting />
          </div>
          <div className="ds-group">
            <span className="label">{t('settings.yourData')}</span>
            <div className="ds-actions">
              <button type="button" className="btn" onClick={clearRecents(t)}>{t('settings.clearRecents')}</button>
              <button type="button" className="btn danger" onClick={clearSaved(t)}>{t('settings.deleteSaved')}</button>
            </div>
            <span className="note">{t('settings.savedOnDevice')}</span>
          </div>
        </div>
      </div>
    </DeskDialog>
  );
}

SettingsDialog.propTypes = {factions: PropTypes.array.isRequired, results: PropTypes.object.isRequired};

export function AboutDialog() {
  const t = useT();
  return (
    <DeskDialog title={t('about.title')} size="about">
      <div className="da-body">
        <span className="da-title">Infinity the Calculator</span>
        <AboutIntro />
        <AboutContact />
        <AboutLinks />
        <p>{t('about.trademark')}</p>
        <dl className="da-facts">
          <dt>{t('about.armyData')}</dt><dd>Corvus Belli Infinity Army{ARMY_DATE ? ` · ${ARMY_DATE}` : ''}</dd>
          <dt>{t('about.rules')}</dt><dd>N5</dd>
          <dt>{t('about.app')}</dt><dd>v{VERSION}</dd>
        </dl>
      </div>
    </DeskDialog>
  );
}
