// The desktop dialogs behind the header buttons (Saved rolls, Settings,
// About): a centred window over the dimmed workbench with a title row and a
// close button. It takes the focus and gives it back; Escape or a click
// outside closes it (one 'back', like the phone pages).
import {useRef} from 'react';
import PropTypes from 'prop-types';
import {CloseIcon} from './icons.jsx';
import {back} from './nav.js';
import useDialogFocus from './useDialogFocus.js';
import useEscape from './useEscape.js';
import {useT} from './i18n.jsx';

// size: 'saved' | 'settings' | 'about', the dialog's width (chrome.css).
// head: what sits between the title and the close button (the saved tabs).
/** @param {{title: string, size: 'saved' | 'settings' | 'about', head?: import('react').ReactNode, children?: import('react').ReactNode}} props */
export default function DeskDialog({title, size, head, children}) {
  const t = useT();
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  useDialogFocus(ref);
  useEscape(back);
  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div ref={ref} className={`desk-dialog ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dd-head">
          <span className="page-title">{title}</span>
          {head}
          <button type="button" className="icon-btn" aria-label={t('keys.closeCap')} onClick={back}><CloseIcon /></button>
        </div>
        {children}
      </div>
    </>
  );
}

DeskDialog.propTypes = {title: PropTypes.string.isRequired, size: PropTypes.string.isRequired, head: PropTypes.node, children: PropTypes.node};
