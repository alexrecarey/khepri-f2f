import {clamp} from 'ramda';

const MIN_BURST = 0;
const MAX_BURST = 6;
const MIN_SUCCESS_VALUE = 1;
const MAX_SUCCESS_VALUE = 30;
const MIN_DAMAGE = 0;
const MAX_DAMAGE = 30;
const MIN_ARMOR = 0;
const MAX_ARMOR = 13;
const MIN_BTS = 0;
const MAX_BTS = 12;
const VALID_AMMO = ['N', 'DA', 'EXP', 'DODGE', 'T2', 'PLASMA'];


function validateParams(p) {
  const defaultInputs = {
    burstA: 3,
    bonusBurstA: 0,
    successValueA: 13,
    damageA: 7,
    armA: 0,
    btsA: 0,
    ammoA: 'N',
    contA: false,
    critImmuneA: false,
    dtwVsDodge: false,
    burstB: 1,
    bonusBurstB: 0,
    successValueB: 13,
    damageB: 7,
    armB: 0,
    btsB: 0,
    ammoB: 'N',
    contB: false,
    critImmuneB: false,
    fixedFaceToFace: false,
  };
  let valid = {}

  // Burst
  let burstA = p.get('burstA')
  if(burstA !== null && !isNaN(Number(burstA))){
    valid['burstA'] = clamp(1, MAX_BURST, Number(burstA));
  }
  let burstB = p.get('burstB')
  if(burstB !== null && !isNaN(Number(burstB))){
    valid['burstB'] = clamp(MIN_BURST, MAX_BURST, Number(burstB));
  }

  // Success Value
  let successValueA = p.get('successValueA');
  if(successValueA !== null && !isNaN(Number(successValueA))){
    valid['successValueA'] = clamp(MIN_SUCCESS_VALUE, MAX_SUCCESS_VALUE, Number(successValueA));
  }
  let successValueB = p.get('successValueB');
  if(successValueB !== null && !isNaN(Number(successValueB))){
    valid['successValueB'] = clamp(MIN_SUCCESS_VALUE, MAX_SUCCESS_VALUE, Number(successValueB));
  }

  // Damage
  let damageA = p.get('damageA');
  if(damageA !== null && !isNaN(Number(damageA))){
    valid['damageA'] = clamp(MIN_DAMAGE, MAX_DAMAGE, Number(damageA))
  }
  let damageB = p.get('damageB');
  if(damageB !== null && !isNaN(Number(damageB))){
    valid['damageB'] = clamp(MIN_DAMAGE, MAX_DAMAGE, Number(damageB))
  }

  // Ammo
  let ammoA = p.get('ammoA');
  if(ammoA !== null && VALID_AMMO.includes(ammoA.toUpperCase())){
    valid['ammoA'] = ammoA.toUpperCase();
  }
  let ammoB = p.get('ammoB');
  if(ammoB !== null && VALID_AMMO.includes(ammoB.toUpperCase())){
    valid['ammoB'] = ammoB.toUpperCase();
  }

  // Armor
  let armA = p.get('armA');
  if(armA !== null && !isNaN(Number(armA))){
    valid['armA'] = clamp(MIN_ARMOR, MAX_ARMOR, Number(armA));
  }
  let armB = p.get('armB');
  if(armB !== null && !isNaN(Number(armB))){
    valid['armB'] = clamp(MIN_ARMOR, MAX_ARMOR, Number(armB));
  }

  // BTS
  let btsA = p.get('btsA');
  if(btsA !== null && !isNaN(Number(btsA))){
    valid['btsA'] = clamp(MIN_BTS, MAX_BTS, Number(btsA));
  }
  let btsB = p.get('btsB');
  if(btsB !== null && !isNaN(Number(btsB))){
    valid['btsB'] = clamp(MIN_BTS, MAX_BTS, Number(btsB));
  }

  // Continuous damage
  let contA = p.get('contA');
  if(contA !== null){
    valid['contA'] = contA.toLowerCase() === 'true';
  }
  let contB = p.get('contB');
  if(contB !== null){
    valid['contB'] = contB.toLowerCase() === 'true';
  }

  // Crit immunity
  let critImmuneA = p.get('critImmuneA');
  if(critImmuneA !== null){
    valid['critImmuneA'] = critImmuneA.toLowerCase() === 'true';
  }
  let critImmuneB = p.get('critImmuneB');
  if(critImmuneB !== null){
    valid['critImmuneB'] = critImmuneB.toLowerCase() === 'true';
  }

  // DTW vs Dodge
  let dtwVsDodge = p.get('dtwVsDodge');
  if(dtwVsDodge !== null){
    valid['dtwVsDodge'] = dtwVsDodge.toLowerCase() === 'true';
  }

  // DTW vs Dodge
  let fixedFaceToFace = p.get('fixedFaceToFace');
  if(fixedFaceToFace !== null){
    valid['fixedFaceToFace'] = fixedFaceToFace.toLowerCase() === 'true';
  }

  return  Object.assign({}, defaultInputs, valid);
}

export default validateParams;
