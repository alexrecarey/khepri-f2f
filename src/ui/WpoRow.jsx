// The two headline numbers, active on the left and reactive on the right,
// each over "wounds / order". The numbers themselves (a rolling value, a
// waiting die) are the caller's.
import PropTypes from 'prop-types';

export default function WpoRow({active, reactive}) {
  return (
    <div className="wpo-row">
      <div className="wpo">{active}<span className="small">wounds / order</span></div>
      <div className="wpo right">{reactive}<span className="small">wounds / order</span></div>
    </div>
  );
}

WpoRow.propTypes = {active: PropTypes.node, reactive: PropTypes.node};
