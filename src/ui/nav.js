// Navigation the overlays share: one step back (the top picker screen, else
// the overlay), as the phone's back gesture does it (state/reduce.js back).
import {dispatch} from '../state/store.js';

export const back = () => dispatch({type: 'back'});
