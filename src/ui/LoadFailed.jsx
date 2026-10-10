// A data chunk (army data, search index) that failed to load, with a way to
// try again instead of "Loading…" forever.
import PropTypes from 'prop-types';

export default function LoadFailed({what, onRetry, className = 'note'}) {
  return (
    <div className={className} role="alert">
      Could not load {what}.{' '}
      <button type="button" className="link-btn" onClick={onRetry}>Try again</button>
    </div>
  );
}

LoadFailed.propTypes = {what: PropTypes.string.isRequired, onRetry: PropTypes.func.isRequired, className: PropTypes.string};
