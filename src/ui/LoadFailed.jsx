// A data chunk (army data, search index) that failed to load, with a way to
// try again instead of "Loading…" forever.
import PropTypes from 'prop-types';
import {useT} from './i18n.jsx';

/** @param {{what: string, onRetry: () => void, className?: string}} props */
export default function LoadFailed({what, onRetry, className = 'note'}) {
  const t = useT();
  return (
    <div className={className} role="alert">
      {t('load.failed', {what})}{' '}
      <button type="button" className="link-btn" onClick={onRetry}>{t('load.retry')}</button>
    </div>
  );
}

LoadFailed.propTypes = {what: PropTypes.string.isRequired, onRetry: PropTypes.func.isRequired, className: PropTypes.string};
