import {Card, CardContent, Grid, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import AmmoInput from './inputs/AmmoInput.jsx';
import ArmorInput from './inputs/ArmorInput.jsx';
import BTSInput from './inputs/BTSInput.jsx';
import BurstInput from './inputs/BurstInput.jsx';
import DamageInput from './inputs/DamageInput.jsx';
import OtherInputs from './inputs/OtherInputs.jsx';
import SuccessValueInput from './inputs/SuccessValueInput.jsx';
import CoverInput from './matchup/CoverInput.jsx';
import FireteamPurityInput from './matchup/FireteamPurityInput.jsx';
import OverridesSection from './matchup/OverridesSection.jsx';
import RangeInput from './matchup/RangeInput.jsx';
import WeaponSelect from './matchup/WeaponSelect.jsx';

const SIDES = {
  A: {title: 'Active', variant: 'active', other: 'B', otherName: 'reactive'},
  B: {title: 'Reactive', variant: 'reactive', other: 'A', otherName: 'active'},
};

const BURST_TOOLTIP = `Final burst after bonuses (fire team, multiple combatants in CC, etc). You can
  set Reactive burst to 0 to calculate unopposed shots by double clicking on the die or
  typing 0 in the value box.`;
const BONUS_TOOLTIP = `Additional dies that are added to the burst but cannot be kept. Only *burst* die
  will be kept, but *burst* + *special dice* die will be rolled. Highest die will be kept.
  You can set to zero by double clicking any value or typing 0 into the value box`;
const SUCCESS_VALUE_TOOLTIP = `Target Success Value for player after all positive and negative mods
  (fireteam, mimetism, range, cover, etc) have been applied to the BS or CC
  attribute. Success values over 20 will cause critical hits starting at 1.
  Remember mods cap out at +/-12.`;
const AMMO_TOOLTIP = `Calculate AP ammo by halving opposing ARM/BTS manually. Dodge will use the burst
  value, so smoke dodges in fire teams can be calculated.`;

// One side's inputs. In Basic mode every calculator param is an input; in
// Matchup mode the side's weapon, range, cover and Fireteam fill them in, and
// the raw values sit in a collapsible Overrides section.
function CalculatorColumn({side, params, setParam, matchup, matchupMode, overridesOpen, onToggleOverrides}) {
  const {title, variant, other, otherName} = SIDES[side];
  const value = (key) => params[`${key}${side}`];
  const set = (key) => setParam(`${key}${side}`);
  const {dtwVsDodge} = params;
  const burst = value('burst');
  const ammo = value('ammo');
  const otherAmmo = params[`ammo${other}`];

  const burstInput = <BurstInput burst={burst} update={set('burst')} variant={variant} title="Burst" tooltip={BURST_TOOLTIP}/>;
  // The active side's roll is replaced by the template (DTW); the reactive
  // side's Dodge still rolls.
  const rollsDice = burst !== 0 && !(side === 'A' && dtwVsDodge);
  const causesSaves = burst !== 0 && ammo !== 'DODGE' && !(side === 'B' && dtwVsDodge);
  // Matchup mode also offers Burst here: a trooper may split their shots
  // between targets.
  const scales = <>
    {matchupMode && burstInput}
    {rollsDice &&
      <SuccessValueInput successValue={value('successValue')} update={set('successValue')} variant={variant}
                         title="Success Value" tooltip={SUCCESS_VALUE_TOOLTIP}/>}
    {causesSaves &&
      <DamageInput damage={value('damage')} update={set('damage')} variant={variant} title="Weapon PS"
                   tooltip={`Possiblity of Survival for the weapon being used. You must include all damage
                   mods like SR-1. You can add cover bonus here or add it to ${otherName} player's ARM.`}/>}
    <ArmorInput armor={value('arm')} update={set('arm')} variant={variant}
                title={otherAmmo === 'PLASMA' ? 'ARM' : 'ARM / BTS'}
                tooltip="Final save roll value, after all modifiers. You must halve and round up if
                opposing player uses AP ammo. If a weapon only targets BTS (like breaker), use BTS value
                here. Generally I like to add the +3 cover bonus here."/>
    {otherAmmo === 'PLASMA' &&
      <BTSInput bts={value('bts')} update={set('bts')} variant={variant} title="BTS"
                tooltip="BTS value. This box only shows if plasma ammo is used."/>}
  </>;

  return (
    <Card style={{alignItems: 'center', justifyContent: 'center'}}>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{fontFamily: 'conthrax'}} gutterBottom>{title}</Typography>
          </Grid>
          {matchupMode && <>
            <WeaponSelect variant={variant} matchup={matchup}/>
            <RangeInput rangeCm={matchup.rangeCm} update={matchup.setRangeCm} row={matchup[side].resolved?.weapon?.row}
                        traits={matchup[side].resolved?.traits} variant={variant}/>
            <FireteamPurityInput value={matchup.ftSize[side]} update={(n) => matchup.setFtSize(side, n)} variant={variant}/>
            <CoverInput variant={variant} matchup={matchup}/>
          </>}
          {!matchupMode && <>
            {burstInput}
            <BurstInput burst={value('bonusBurst')} update={set('bonusBurst')} variant={variant} role='bonus'
                        title="Special dice" tooltip={BONUS_TOOLTIP}/>
          </>}
          {matchupMode ? <OverridesSection open={overridesOpen} onToggle={onToggleOverrides}>{scales}</OverridesSection> : scales}
          {!matchupMode && <>
            <AmmoInput ammo={ammo} cont={value('cont')} update={set('ammo')} updateCont={set('cont')}
                       shock={value('shock')} updateShock={set('shock')} variant={variant}
                       dtw={side === 'B' ? dtwVsDodge : undefined} title="Ammunition" tooltip={AMMO_TOOLTIP}/>
            {side === 'A'
              ? <OtherInputs critImmune={value('critImmune')} update={set('critImmune')}
                             dtwVsDodge={dtwVsDodge} updateDtw={setParam('dtwVsDodge')}/>
              : <OtherInputs critImmune={value('critImmune')} update={set('critImmune')} variant={variant}
                             fixedFaceToFace={params.fixedFaceToFace} updateFixedFaceToFace={setParam('fixedFaceToFace')}/>}
          </>}
        </Grid>
      </CardContent>
    </Card>
  );
}

CalculatorColumn.propTypes = {
  side: PropTypes.oneOf(['A', 'B']).isRequired,
  params: PropTypes.object.isRequired,
  setParam: PropTypes.func.isRequired,
  matchup: PropTypes.object.isRequired,
  matchupMode: PropTypes.bool.isRequired,
  overridesOpen: PropTypes.bool.isRequired,
  onToggleOverrides: PropTypes.func.isRequired,
};

export default CalculatorColumn;
