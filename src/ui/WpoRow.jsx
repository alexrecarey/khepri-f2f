// The two headline numbers, active on the left and reactive on the right,
// each over its label ("wounds / order" unless the player chose another
// headline, results/headline.js). The numbers themselves (a sliding value, a waiting
// die) are the caller's; middle sits between them (the headline dots).
import PropTypes from 'prop-types';
import {useT} from './i18n.jsx';

/** @param {{active: import('react').ReactNode, reactive: import('react').ReactNode, labels?: {active: string, reactive: string} | null, middle?: import('react').ReactNode}} props */
export default function WpoRow({active, reactive, labels: given = null, middle = null}) {
  const t = useT();
  const labels = given ?? {active: t('headline.wpoLabel'), reactive: t('headline.wpoLabel')};
  return (
    <div className="wpo-row">
      <div className="wpo">{active}<span className="small">{labels.active}</span></div>
      {middle}
      <div className="wpo right">{reactive}<span className="small">{labels.reactive}</span></div>
    </div>
  );
}

WpoRow.propTypes = {active: PropTypes.node, reactive: PropTypes.node, labels: PropTypes.object, middle: PropTypes.node};
