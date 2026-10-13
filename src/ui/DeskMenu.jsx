// The menu on wide screens (design canvas Final: "Desktop menu — header
// buttons (A)"): Saved, Settings and About sit in the header and each opens a
// centred dialog (DeskDialog.jsx); the open one's button stays pressed. The
// phone keeps the ⋯ menu sheet and full-screen pages (Chrome.jsx).
import {useMemo} from 'react';
import PropTypes from 'prop-types';
import {dispatch, useAppState} from '../state/store.js';
import {
  ARMY_DATE, AboutContact, AboutIntro, AboutLinks, LanguageSetting, MADE_BY, StartFaction, TRADEMARK, VERSION,
  clearRecents, clearSaved, setHeadline,
} from './Chrome.jsx';
import DeskDialog from './DeskDialog.jsx';
import {HEADLINES, HEADLINE_HINTS, HEADLINE_NAMES, headline, headlineChoice} from './headline.js';
import {BookmarkIcon, GearIcon, InfoIcon} from './icons.jsx';
import {summarize} from './results.js';

// A second click on the open page's button closes it.
const toggle = (overlay, open) => dispatch(open ? {type: 'back'} : {type: 'openOverlay', overlay});

export function HeaderButtons() {
  const overlay = useAppState((s) => s.ui.overlay);
  const savedCount = useAppState((s) => s.lists.saved.length);
  const button = (name, label, icon, extra) => (
    <button type="button" className={`hdr-btn${label ? '' : ' icon'}`} aria-pressed={overlay === name}
      aria-label={label ? undefined : name[0].toUpperCase() + name.slice(1)} onClick={() => toggle(name, overlay === name)}>
      {icon}{label}{extra}
    </button>
  );
  return (
    <span className="hdr-btns">
      {button('saved', 'Saved', <BookmarkIcon />, savedCount > 0 && <span className="n">{savedCount}</span>)}
      {button('settings', 'Settings', <GearIcon />)}
      {button('about', null, <InfoIcon />)}
    </span>
  );
}

// results: {result, targets, params} of the roll on screen, so each choice
// shows what the card would read with it (the active side's number).
export function SettingsDialog({factions, results}) {
  const choice = useAppState((s) => headlineChoice(s.prefs));
  const s = useMemo(() => summarize(results.result, results.targets), [results.result, results.targets]);
  return (
    <DeskDialog title="Settings" size="settings">
      <div className="ds-body">
        <div className="ds-group">
          <span className="label" id="ds-headline">Results card</span>
          <div className="ds-choices" role="radiogroup" aria-labelledby="ds-headline">
            {HEADLINES.map((c) => (
              <label key={c} className="ds-choice">
                <input type="radio" name="headline" value={c} checked={choice === c} onChange={() => setHeadline(c)} />
                <span className="radio-text"><span>{HEADLINE_NAMES[c]}</span><span className="note">{HEADLINE_HINTS[c]}</span></span>
                {s && <span className="val">{headline(s, c, results.params).text.active}</span>}
              </label>
            ))}
          </div>
          <span className="note">The big number on the results card. Click the dots under it to change it there too.</span>
        </div>
        <div className="ds-col">
          <div className="ds-group">
            <span className="label">Starting factions</span>
            <StartFaction side="A" label="Active side" factions={factions} className="c-active" />
            <StartFaction side="B" label="Reactive side" factions={factions} className="c-reactive" />
          </div>
          <div className="ds-group">
            <span className="label">Language</span>
            <LanguageSetting />
          </div>
          <div className="ds-group">
            <span className="label">Your data</span>
            <div className="ds-actions">
              <button type="button" className="btn" onClick={clearRecents}>Clear recent troopers</button>
              <button type="button" className="btn danger" onClick={clearSaved}>Delete all saved rolls</button>
            </div>
            <span className="note">Saved rolls live only on this device.</span>
          </div>
        </div>
      </div>
    </DeskDialog>
  );
}

SettingsDialog.propTypes = {factions: PropTypes.array.isRequired, results: PropTypes.object.isRequired};

export function AboutDialog() {
  return (
    <DeskDialog title="About" size="about">
      <div className="da-body">
        <span className="da-title">Infinity the Calculator</span>
        <AboutIntro />
        <dl className="da-facts">
          <dt>Army data</dt><dd>Corvus Belli Infinity Army{ARMY_DATE ? ` · ${ARMY_DATE}` : ''}</dd>
          <dt>Rules</dt><dd>N5</dd>
          <dt>App</dt><dd>v{VERSION}</dd>
        </dl>
        <p>{MADE_BY}</p>
        <AboutContact />
        <AboutLinks />
        <p className="da-fine">{TRADEMARK}</p>
      </div>
    </DeskDialog>
  );
}
