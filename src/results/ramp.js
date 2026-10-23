// The wound shades' colour ramps: one per side, mildest to deepest. The
// steps between them are interpolated in summary.js (shade), which runs in
// the Worker as well as the app, so the ends live here as hex rather than
// as CSS custom properties (tokens.css points here).
// The ramps are the sides' chosen tones (Alex, Oct 2026): don't darken them
// for contrast. White text holds 4.5:1 on both deep ends; on the active step
// 5 it is 4.36:1, the closest these tones allow.
export const RAMP = {active: ['#cdeee2', '#1f6b52'], reactive: ['#f6d9e8', '#8e3b67']};
