// The desktop dialogs behind the header buttons (Saved rolls, Settings,
// About): a centred window over the dimmed workbench with a title row and a
// close button. It takes the focus and gives it back; Escape or a click
// outside closes it (one 'back', like the phone pages).
import {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {dispatch} from '../state/store.js';
import {CloseIcon} from './icons.jsx';
import useDialogFocus from './useDialogFocus.js';

const back = () => dispatch({type: 'back'});

// size: 'saved' | 'settings' | 'about', the dialog's width (chrome.css).
// head: what sits between the title and the close button (the saved tabs).
export default function DeskDialog({title, size, head, children}) {
  const ref = useRef(null);
  useDialogFocus(ref);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') back(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <div className="desk-scrim" onClick={back} />
      <div ref={ref} className={`desk-dialog ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dd-head">
          <span className="page-title">{title}</span>
          {head}
          <button type="button" className="icon-btn" aria-label="Close" onClick={back}><CloseIcon /></button>
        </div>
        {children}
      </div>
    </>
  );
}

DeskDialog.propTypes = {title: PropTypes.string.isRequired, size: PropTypes.string.isRequired, head: PropTypes.node, children: PropTypes.node};
