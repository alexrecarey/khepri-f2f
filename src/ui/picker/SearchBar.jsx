// The picker's search box, at the top of the screen (Spotify style): a pill
// field with the side's colour on its icon, a hint for a placeholder, a
// clear button, and Cancel. The hint is picked once when the picker opens
// and kept (no cycling); screen readers get the fixed label instead.
import {useState} from 'react';
import {SearchIcon} from '../icons.jsx';
import {searchHints} from './constants.js';
import {useT} from '../i18n.jsx';

/**
 * @param {{side: import('../../types.js').Side, color: string, query: string, onQuery: (q: string) => void,
 *   onSubmit: () => void, onKeyDown?: (e: import('react').KeyboardEvent<HTMLInputElement>) => void,
 *   onCancel: () => void, inputRef: import('react').RefObject<HTMLInputElement>, activeId?: string}} props
 */
export default function SearchBar({side, color, query, onQuery, onSubmit, onKeyDown, onCancel, inputRef, activeId}) {
  const t = useT();
  const hints = searchHints(t.lang, side);
  const [hint] = useState(() => hints[Math.floor(Math.random() * hints.length)]);
  const [q, what] = hint;
  return (
    <form className="search-bar" role="search" autoComplete="off" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <label className={`search-field ${color}${query ? ' has-text' : ''}`} htmlFor={`trooper-search-${side}`}>
        <SearchIcon />
        <input
          id={`trooper-search-${side}`}
          ref={inputRef}
          type="search"
          // No "name" in the label: it made browsers offer contact AutoFill.
          aria-label={t('picker.search')}
          name={`trooper-search-${side}`}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="picker-results"
          aria-activedescendant={activeId}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
        <span className="hint" aria-hidden="true">
          {t(what ? 'picker.hintFor' : 'picker.hint', {query: q, what: what ?? ''})}
        </span>
        <button type="button" className="clear" aria-label={t('picker.clear')} onClick={() => { onQuery(''); inputRef.current?.focus(); }} />
      </label>
      <button type="button" className="text-btn" onClick={onCancel}>{t('picker.cancel')}</button>
    </form>
  );
}
