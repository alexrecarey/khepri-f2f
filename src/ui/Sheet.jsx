// Overlays: a bottom sheet over a dimmed screen, and a full-screen page.
// Both close on Escape; the sheet also on a tap outside it.
import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {BackIcon} from './icons.jsx';

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

export function Sheet({onClose, label, children}) {
  useEscape(onClose);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <span className="handle" />
        {children}
      </div>
    </>
  );
}

Sheet.propTypes = {onClose: PropTypes.func.isRequired, label: PropTypes.string.isRequired, children: PropTypes.node};

export function Page({title, subtitle, onBack, children, footer, action}) {
  useEscape(onBack);
  return (
    <div className="page" role="dialog" aria-modal="true" aria-label={title}>
      <div className="page-head">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}><BackIcon /></button>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0}}>
          <span className="page-title">{title}</span>
          {subtitle && <span className="note">{subtitle}</span>}
        </div>
        {action}
      </div>
      <div className="page-body">{children}</div>
      {footer}
    </div>
  );
}

Page.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  onBack: PropTypes.func.isRequired,
  children: PropTypes.node,
  footer: PropTypes.node,
  action: PropTypes.node,
};
