// Overlays: a bottom sheet over a dimmed screen, and a full-screen page.
// Both close on Escape; the sheet also on a tap outside it.
import {useRef} from 'react';
import PropTypes from 'prop-types';
import {BackIcon} from './icons.jsx';
import useDialogFocus from './useDialogFocus.js';
import useEscape from './useEscape.js';
import useVisualViewport from './useVisualViewport.js';
import {useT} from './i18n.jsx';

// `actions`: small buttons on the handle's row (Save, Share). `sheetRef` /
// `scrimRef`: for swipe gestures (useSheetGestures.js).
/**
 * @param {{onClose: () => void, label: string, children?: import('react').ReactNode, actions?: import('react').ReactNode,
 *   sheetRef?: import('react').RefObject<HTMLDivElement>, scrimRef?: import('react').RefObject<HTMLDivElement>}} props
 */
export function Sheet({onClose, label, children, actions, sheetRef, scrimRef}) {
  useEscape(onClose);
  const own = useRef(/** @type {HTMLDivElement | null} */ (null));
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
/**
 * @param {{title: import('react').ReactNode, subtitle?: import('react').ReactNode, onBack: () => void, children?: import('react').ReactNode,
 *   footer?: import('react').ReactNode, action?: import('react').ReactNode, closeLabel?: string, label?: string, className?: string}} props
 */
export function Page({title, subtitle, onBack, children, footer, action, closeLabel, label, className = ''}) {
  const t = useT();
  useEscape(onBack);
  useVisualViewport();
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  useDialogFocus(ref);
  return (
    <div ref={ref} className={`page ${className}`} role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)}>
      <div className={`page-head${closeLabel ? ' no-back' : ''}`}>
        {!closeLabel && <button type="button" className="icon-btn" aria-label={t('keys.back')} onClick={onBack}><BackIcon /></button>}
        <div className="page-titles">
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
