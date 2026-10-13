// Overlays: a bottom sheet over a dimmed screen, and a full-screen page.
// Both close on Escape; the sheet also on a tap outside it.
import {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {BackIcon} from './icons.jsx';
import useDialogFocus from './useDialogFocus.js';
import useVisualViewport from './useVisualViewport.js';

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

// `actions`: small buttons on the handle's row (Save, Share). `sheetRef` /
// `scrimRef`: for swipe gestures (useSheetGestures.js).
export function Sheet({onClose, label, children, actions, sheetRef, scrimRef}) {
  useEscape(onClose);
  const own = useRef(null);
  const ref = sheetRef ?? own;
  useDialogFocus(ref);
  return (
    <>
      <div className="scrim" ref={scrimRef} onClick={onClose} />
      <div className="sheet" ref={ref} role="dialog" aria-modal="true" aria-label={label}>
        <div className="sheet-head"><span /><span className="handle" /><span className="sheet-actions">{actions}</span></div>
        {children}
      </div>
    </>
  );
}

Sheet.propTypes = {
  onClose: PropTypes.func.isRequired, label: PropTypes.string.isRequired, children: PropTypes.node, actions: PropTypes.node,
  sheetRef: PropTypes.object, scrimRef: PropTypes.object,
};

// `closeLabel` ("Cancel"): the page is the first of its stack, so it closes
// with a text button on the right instead of a back arrow.
export function Page({title, subtitle, onBack, children, footer, action, closeLabel, label, className = ''}) {
  useEscape(onBack);
  useVisualViewport();
  const ref = useRef(null);
  useDialogFocus(ref);
  return (
    <div ref={ref} className={`page ${className}`} role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)}>
      <div className="page-head" style={closeLabel ? {paddingLeft: 16} : undefined}>
        {!closeLabel && <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}><BackIcon /></button>}
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0}}>
          <span className="page-title">{title}</span>
          {subtitle && <span className="note">{subtitle}</span>}
        </div>
        {action}
        {closeLabel && <button type="button" className="text-btn" onClick={onBack}>{closeLabel}</button>}
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
  closeLabel: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};
