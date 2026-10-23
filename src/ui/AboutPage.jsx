// The About page behind the ⋯ menu (phone; the desktop dialog in DeskMenu.jsx
// reuses the parts), and the build's version and army date it shows.
import {dispatch} from '../state/store.js';
import {Page} from './Sheet.jsx';
import {Rich, useT} from './i18n.jsx';

/* global __APP_VERSION__, __ARMY_DATE__ */
export const VERSION = typeof __APP_VERSION__ === 'undefined' ? 'dev' : __APP_VERSION__;
export const ARMY_DATE = typeof __ARMY_DATE__ === 'undefined' ? null : __ARMY_DATE__;

const back = () => dispatch({type: 'back'});

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

// One overlay, so Back closes it.
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
