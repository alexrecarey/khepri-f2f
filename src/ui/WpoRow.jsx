// The two headline numbers, active on the left and reactive on the right,
// each over its label ("wounds / order" unless the player chose another
// headline, headline.js). The numbers themselves (a sliding value, a waiting
// die) are the caller's; middle sits between them (the headline dots).
import PropTypes from 'prop-types';

const WPO = {active: 'wounds / order', reactive: 'wounds / order'};

export default function WpoRow({active, reactive, labels = WPO, middle = null}) {
  return (
    <div className="wpo-row">
      <div className="wpo">{active}<span className="small">{labels.active}</span></div>
      {middle}
      <div className="wpo right">{reactive}<span className="small">{labels.reactive}</span></div>
    </div>
  );
}

WpoRow.propTypes = {active: PropTypes.node, reactive: PropTypes.node, labels: PropTypes.object, middle: PropTypes.node};
