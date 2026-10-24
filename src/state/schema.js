// The app's one state document (docs/plans/redesign.md, section 2). Every
// screen is a pure function of this object plus the static army data; anything
// else on screen is derived from it. Plain, JSON-serializable data only.
//
// Slices, by where they live:
//   mode, matchup, classic   shareable: mirrored into the URL (url.js)
//   prefs, lists             persisted on this device (storage.js)
//   ui                       ephemeral: overlays, open selectors, picker stack
import * as v from 'valibot';
import {DEFAULT_PARAMS} from '../engine/params.js';
import {arrayOf, intFrom, intIn, textUpTo} from '../lib/parse.js';
import {DEFAULT_HEADLINE, HEADLINES} from '../results/headline.js';
import {CC_ALLIES_MAX} from '../rules/closeCombat.js';
import {FIRETEAM_MAX, HACKED_RESET_MODS} from '../rules/modifiers.js';
import {RANGE_BANDS} from '../rules/ranges.js';
import {FIREWALL_CHIPS} from '../rules/trooper.js';
import {MODES} from './modes.js';

export const STATE_VERSION = 1;

/** @type {import('../types.js').Side[]} */
const SIDES = ['A', 'B'];

// The two sides: A is the active trooper, B the reactive one.
/** @type {Record<import('../types.js').Side, 'active' | 'reactive'>} */
export const ROLE = {A: 'active', B: 'reactive'};
export {other} from '../lib/side.js';

// One side of a matchup: ids into the army data plus the situation chips.
// weaponKey null = the default weapon for the side (rules/defaultWeapon.js),
// worked out when the matchup is derived, never stored. SelectionSchema
// below says what each field may hold; this is what it falls back to.
export const EMPTY_SIDE = {
  unitId: null,
  factionId: null,
  groupId: null,
  profileId: null,
  optionId: null,
  weaponKey: null,
  inCover: false,
  // The Firewall chip against a Comms Attack: -3, -6, 0 for none, null for
  // the trooper's own Firewall (none without one).
  firewall: null,
  // In a Foxhole (units with Sapper): cover and Mimetism (-3); replaces inCover.
  sapper: false,
  // Situation chips on the side's own roll (rules/modifiers.js): the target is
  // Targeted (+3 to a shot or program against it, -3 to its Reset), Hacked (-3 to -12 to a Reset, 0 for
  // none), Immobilized-A (-6 to a Dodge).
  targeted: false,
  hackedReset: 0,
  immA: false,
  // Use Surprise Attack (active side, units with the skill).
  surpriseAttack: false,
  // Declare Berserk (active side, units with the skill): a CC Attack.
  berserk: false,
  // Team-Ops: index into unit.upgrades.chart / .ball, or null.
  upgrade: null,
  ball: null,
  // Fireteam size; 1 = not in a fireteam.
  ftSize: 1,
  // Allies in base contact with the target, each +1 B to a CC Attack.
  ccAllies: 0,
};

// Army ids are numbers (army.json, matchup/matchupParams.js).
const id = v.nullable(intFrom(1));
// No key is longer (army/weapons.js `${id}:${mode}`, hacking.js `hack:${id}`).
const WEAPON_KEY_MAX = 64;
/**
 * A field's schema, falling back to EMPTY_SIDE's value: a bad field is
 * replaced, the rest of the side kept.
 * @template {v.GenericSchema} S
 * @param {keyof typeof EMPTY_SIDE} key
 * @param {S} schema
 */
const field = (key, schema) => v.fallback(schema, /** @type {v.InferOutput<S>} */ (EMPTY_SIDE[key]));

// A Selection (types.js) as it comes from a share link or a saved roll.
export const SelectionSchema = v.object({
  unitId: field('unitId', id),
  factionId: field('factionId', id),
  groupId: field('groupId', id),
  profileId: field('profileId', id),
  optionId: field('optionId', id),
  // null = the default weapon for the side (rules/defaultWeapon.js)
  weaponKey: field('weaponKey', v.nullable(textUpTo(WEAPON_KEY_MAX))),
  inCover: field('inCover', v.boolean()),
  // -3, -6, 0 for none, null for the trooper's own Firewall
  firewall: field('firewall', v.nullable(v.picklist([...FIREWALL_CHIPS, 0]))),
  // in a Foxhole (units with Sapper)
  sapper: field('sapper', v.boolean()),
  targeted: field('targeted', v.boolean()),
  // the Hacked chip's MOD to a Reset, 0 for none
  hackedReset: field('hackedReset', v.picklist([...HACKED_RESET_MODS, 0])),
  immA: field('immA', v.boolean()),
  surpriseAttack: field('surpriseAttack', v.boolean()),
  berserk: field('berserk', v.boolean()),
  // Team-Ops: index into unit.upgrades.chart / .ball
  upgrade: field('upgrade', v.nullable(intFrom(0))),
  ball: field('ball', v.nullable(intFrom(0))),
  // Fireteam size; 1 = not in a fireteam
  ftSize: field('ftSize', intIn([1, FIRETEAM_MAX])),
  // allies in base contact with the target
  ccAllies: field('ccAllies', intIn([0, CC_ALLIES_MAX])),
});

// The distance both sides share, as the upper bound of a range band in cm
// (rules/ranges.js RANGE_BANDS): 40 = 8-16". matchup.rangeCmB is null, or the
// reactive's own distance when the range is split (it answers a different
// trooper, or from somewhere else); rangeCm is then the active's.
export const DEFAULT_RANGE_CM = 40;

// Smoke / White Noise between the troopers (rules/visibility.js): like the
// range, they belong to the table, not to either side.
export const NO_ZONES = {smoke: false, whiteNoise: false};

// A distance as a range band's upper bound in cm.
export const BandSchema = v.picklist(RANGE_BANDS.map((b) => b.to));

// A Matchup (types.js): both sides, the distance and the table's zones, as
// a saved roll's setup holds it. A side that isn't an object is empty.
export const MatchupSchema = v.object({
  A: v.fallback(SelectionSchema, () => ({...EMPTY_SIDE})),   // the active trooper
  B: v.fallback(SelectionSchema, () => ({...EMPTY_SIDE})),   // the reactive trooper
  rangeCm: v.fallback(BandSchema, DEFAULT_RANGE_CM),         // the distance both share
  rangeCmB: v.fallback(v.nullable(BandSchema), null),        // the reactive's own distance when the range is split, else null
  smoke: v.fallback(v.boolean(), NO_ZONES.smoke),
  whiteNoise: v.fallback(v.boolean(), NO_ZONES.whiteNoise),
});

// An empty matchup: initialState's, and what a saved setup that isn't an
// object at all loads as (rolls.js normalizeSetup).
export const emptyMatchup = () => ({A: {...EMPTY_SIDE}, B: {...EMPTY_SIDE}, rangeCm: DEFAULT_RANGE_CM, rangeCmB: null, ...NO_ZONES});

export const MAX_RECENTS = 8; // per side

// The recents for one side, newest first. Untagged (older) entries belong to both.
/**
 * @param {import('../types.js').Recent[]} recents
 * @param {import('../types.js').Side} side
 */
export const recentsFor = (recents, side) => recents.filter((r) => r.side == null || r.side === side);
export const MAX_RECENT_FACTIONS = 3;

// ---- What this device keeps (storage.js), as stored data is read back ----

// The results card's big number (headlines.js): a choice, else the default.
export const HeadlineSchema = v.fallback(v.picklist(HEADLINES), DEFAULT_HEADLINE);
// A vanilla faction id; null for All (scopes) or the last one used (startFaction).
const factionOrNull = v.optional(v.fallback(v.nullable(intFrom(1)), null));

// The player's preferences (types.js Prefs): each one optional, a bad one
// read as never chosen.
export const PrefsSchema = v.object({
  headline: v.optional(HeadlineSchema),
  // the language picked in Settings (language.js); null: automatic
  language: v.optional(v.fallback(v.nullable(v.string()), null)),
  // the faction each side's picker opens on
  startFaction: v.optional(v.fallback(v.object({A: factionOrNull, B: factionOrNull}), {})),
});

// A trooper picked before (types.js Recent): stable army ids plus the side
// it was picked for; entries saved before the tag have no side. One that
// lacks an id can't be found again and is dropped.
export const RecentSchema = v.object({
  unitId: intFrom(1),
  groupId: intFrom(1),
  optionId: intFrom(1),
  armyFactionId: intFrom(1),
  side: v.optional(v.picklist(SIDES)),
});

const text = v.fallback(v.string(), '');
// What a saved roll's row shows (types.js RollSummary, rolls.js): a missing
// line shows as nothing.
export const RollSummarySchema = v.object({
  a: text,                                   // "Squalos · HMG" (Matchup) or "Active" (Classic)
  r: text,
  ad: text,                                  // "B4 SV15 PS7"
  rd: text,
  setup: text,                               // '24-32" · Cover · Fireteam 5'
  ap: text,                                  // chance each side wins (or, not face to face, causes a wound)
  rp: text,
  au: v.optional(v.string()),                // unit and weapon apart (Matchup)
  aw: v.optional(v.string()),
  ru: v.optional(v.string()),
  rw: v.optional(v.string()),
  ca: v.optional(v.nullable(v.string())),    // unit crest slugs (army/crests.js)
  cr: v.optional(v.nullable(v.string())),
  fa: v.optional(v.nullable(v.number())),    // vanilla faction ids, whose crest stands in
  fr: v.optional(v.nullable(v.number())),
});

// A saved roll (types.js SavedRoll): the setup to load back and its summary.
// The setup is any object here; its mode's schema reads it when it is
// loaded or compared (rolls.js normalizeSetup).
export const SavedRollSchema = v.object({
  id: v.string(),
  mode: v.picklist(Object.values(MODES)),
  savedAt: v.fallback(v.number(), 0),
  setup: v.record(v.string(), v.unknown()),
  summary: RollSummarySchema,
});

const integer = v.pipe(v.number(), v.integer());
// The persisted slices (storage.js loadPersisted): a slice that can't be
// read is empty, a list item that can't be read is dropped.
export const PersistedSchema = v.object({
  mode: v.fallback(v.optional(v.picklist(Object.values(MODES))), undefined),
  prefs: v.fallback(PrefsSchema, {}),
  lists: v.fallback(v.object({
    recents: v.fallback(v.pipe(arrayOf(RecentSchema), v.transform((xs) => xs.slice(0, MAX_RECENTS * 2))), []),
    recentFactions: v.fallback(arrayOf(integer), []),
    saved: v.fallback(arrayOf(SavedRollSchema), []),
  }), () => ({recents: [], recentFactions: [], saved: []})),
  scopes: v.fallback(v.object({A: v.optional(v.nullable(integer)), B: v.optional(v.nullable(integer))}), {}),
});

// The ephemeral slice: overlays, the picker stack, a chip's inline editor,
// the toast (types.js UiState).
/** @type {import('../types.js').UiState} */
export const EMPTY_UI = {overlay: null, picker: null, rangeOpen: false, edit: null, savedTab: null, swiped: null, toast: null};

/** @returns {import('../types.js').AppState} */
export function initialState() {
  return {
    v: STATE_VERSION,
    mode: MODES.matchup,
    matchup: emptyMatchup(),
    classic: {...DEFAULT_PARAMS},
    ui: {...EMPTY_UI},
    // startFaction: {A, B}, the faction the picker opens on for an empty side
    // (null = the last one used)
    prefs: {},
    // The faction each side's picker is scoped to, remembered per side: {A, B},
    // a vanilla faction id or null for All factions; a missing side has no
    // choice yet (actions.js scopeFor). Cleared with the troopers.
    scopes: {},
    // recents: troopers picked, newest first, as stable army ids plus the
    //   side they were picked for: {unitId, groupId, optionId, armyFactionId, side}.
    //   Active and Reactive each keep their own MAX_RECENTS; entries saved
    //   before the tag existed have no side and count for both (recentsFor).
    // recentFactions: vanilla faction ids scoped to in the picker, newest first
    lists: {recents: [], recentFactions: [], saved: []},
  };
}
