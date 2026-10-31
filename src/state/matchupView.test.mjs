// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {pickTrooper, setUpgrade} from './actions.js';
import {matchupCore, matchupView, renderMatchup} from './matchupView.js';
import {translator} from '../i18n/index.js';
import es from '../i18n/es.js';
import {reduce} from './reduce.js';
import {EMPTY_SIDE, initialState} from './schema.js';
import {unitById} from '../army/lookup.js';
import {army, unitByIsc} from '../army/testArmy.mjs';
import {matchupRollSummary} from './rolls.js';

/** @typedef {import('../types.js').MatchupView} MatchupView */
/** @typedef {import('../types.js').LedgerSide} LedgerSide */
/** @typedef {import('../types.js').Section} Section */
/** @typedef {import('../types.js').ResolvedSide} ResolvedSide */
/** @typedef {import('../types.js').AppState} AppState */

// Share-link ids: Corax-1 (Viral) and Chaksa.
const corax = {...EMPTY_SIDE, unitId: 1934, factionId: 603, groupId: 1, optionId: 4};
const chaksa = {...EMPTY_SIDE, unitId: 1310, factionId: 801, groupId: 1, optionId: 1};

test('no weapon picked: each side rolls its default weapon, and the matchup is complete', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.ok(v.A.sel.weaponKey);
  assert.ok(v.B.sel.weaponKey);
  assert.ok(v.complete);
  assert.ok(v.params && v.ledger);
  assert.ok(v.params.burstA >= 1);
  assert.match(/** @type {LedgerSide} */ (v.ledger.ledger.A).dice, /^B\d/);
  // The default is derived, never written back into the document.
  assert.equal(corax.weaponKey, null);
});

test('without the army data the view is empty but keeps the selections', () => {
  const v = matchupView(null, {A: corax, B: chaksa, rangeCm: 40});
  assert.equal(v.ready, false);
  assert.equal(v.complete, false);
  assert.ok(v.hasSelection);
  // The empty side is sideView's own shape, not a copy of it.
  const full = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.deepEqual(Object.keys(v.A), Object.keys(full.A));
  assert.equal(v.A.sel.unitId, corax.unitId);
  assert.deepEqual([v.A.resolved, v.A.weapons, v.A.groups, v.A.pseudo, v.A.cc, v.A.hacked], [null, [], [], [], false, false]);
});

test('matchupCore resolves each side once and its view reads that resolution\'s lists', () => {
  // resolveSelection reaches the unit through army.units (army/lookup.js) and
  // nothing else in the core does, so those reads count the resolutions.
  let reads = 0;
  const counted = new Proxy(army, {get: (t, k) => { if (k === 'units') reads++; return t[/** @type {keyof typeof t} */ (k)]; }});
  unitById(counted, corax.unitId);   // the lookup builds its map on the first read
  reads = 0;
  const core = matchupCore(counted, {A: corax, B: chaksa, rangeCm: 40});
  assert.equal(reads, 2);
  for (const x of [core.A, core.B]) {
    assert.ok(x.resolved);
    assert.equal(x.weapons, x.resolved.weapons);
    assert.equal(x.ccWeapons, x.resolved.ccWeapons);
    assert.equal(x.programs, x.resolved.programs);
    // The default pick is in the lists it was picked from.
    assert.ok(x.weapons.includes(/** @type {import('../types.js').WeaponEntry} */ (x.resolved.weapon)));
  }
  // The reactive side alone is offered No ARO.
  assert.ok(!core.A.pseudo.some((w) => w.kind === 'none'));
  assert.ok(core.B.pseudo.some((w) => w.kind === 'none'));
});

test('pickTrooper preselects the weapon the query matched', () => {
  const view = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  const other = view.A.weapons.find((w) => w.key !== view.A.sel.weaponKey);
  assert.ok(other);
  // A weapon's id is the Army's number (a program's would be its key).
  const hit = /** @type {import('../types.js').ProfileHit} */ ({unitId: 1934, armyFactionId: 603, groupId: 1, profileId: null, optionId: 4, weaponId: other.id});
  const s = reduce(initialState(), pickTrooper(army, 'A', hit));
  assert.equal(army.weapons[other.id] !== undefined, true);
  assert.equal(/** @type {import('../types.js').WeaponEntry} */ (/** @type {ResolvedSide} */ (matchupView(army, s.matchup).A.resolved).weapon).id, other.id);
});

test('side cards: weapon groups, names, faction and the chips that apply', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  for (const s of /** @type {import('../types.js').Side[]} */ (['A', 'B'])) {
    const side = v[s];
    assert.ok(side.resolved);
    assert.ok(side.groups.length > 0);
    // Every weapon, CC weapon, program and pseudo-weapon (Dodge...) is in exactly one group.
    const keys = side.groups.flatMap((g) => (g.modes ? g.modes.map((w) => w.key) : [g.w.key]));
    assert.deepEqual([...keys].sort(), [...side.weapons, ...side.ccWeapons, ...side.programs, ...side.pseudo].map((w) => w.key).sort());
    assert.equal(side.short, side.resolved.unit.isc.split(',')[0].trim());
    assert.ok(side.faction);
  }
  assert.equal(v.B.surprise, 0);   // Surprise Attack is offered on the active side only
});

test('range bands: each side\'s Range MOD per band; none for a Dodge', () => {
  const v = matchupView(army, {A: corax, B: {...chaksa, weaponKey: 'dodge'}, rangeCm: 40});
  assert.equal(v.bands.length, 7);
  assert.ok(v.bands.some((b) => typeof b.A === 'number'));
  assert.ok(v.bands.every((b) => b.B === undefined));
});

test('Smoke is passed to the rules: a side without MSV that cannot see rolls nothing', () => {
  const plain = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  const smoke = matchupView(army, {A: corax, B: chaksa, rangeCm: 40, smoke: true});
  assert.deepEqual(smoke.zones, {smoke: true, whiteNoise: false});
  assert.ok(smoke.vis && smoke.vis.A && smoke.vis.B);
  // Whatever these two carry, Smoke changes the dice or blocks a side.
  assert.notDeepEqual(smoke.params, plain.params);
});

// The first loadout (in army order) carrying weapon `id`, as a selection.
function withWeapon(id) {
  for (const u of army.units) {
    for (const [fid, {groups}] of Object.entries(u.byFaction)) {
      for (const g of groups) {
        const o = g.options.find((x) => x.weapons.some((w) => w.id === id));
        if (o) return {...EMPTY_SIDE, unitId: u.id, factionId: Number(fid), groupId: g.id, profileId: g.profiles[0].id, optionId: o.id};
      }
    }
  }
  return null;
}

test('CC weapons are in the weapon list; a CC Mode joins its weapon as a BS / CC mode', () => {
  const kobra = withWeapon(221);
  assert.ok(kobra);
  const v = matchupView(army, {A: kobra, B: chaksa, rangeCm: 40});
  const g = v.A.groups.find((x) => x.id === 221);
  assert.ok(g && g.modes && g.labels);
  const labels = g.labels;
  assert.deepEqual(g.modes.map((w) => labels.get(w.key)), ['BS', 'CC']);
  assert.ok(v.A.groups.some((x) => x.w.kind === 'cc' && !x.modes));
  // The default stays a shot.
  assert.equal(v.A.resolved?.weapon?.kind, 'bs');
});

test('Team-Ops chips: the chart and TacBall options show for Team-Ops troopers only', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.ok(v.A.teamOps);
  assert.ok(v.A.teamOps.chart.includes('BS+1'));
  assert.ok(v.A.teamOps.ball.includes('Plasma Carbine'));
  assert.equal(v.B.teamOps, null);
});

test('Team-Ops picks: a weapon joins the weapon list, a stat shows in the ledger, dropping it resets the weapon', () => {
  const at = (A) => matchupView(army, {A, B: chaksa, rangeCm: 40});
  const t = at(corax).A.teamOps;
  assert.ok(t);
  const plain = at(corax);
  assert.ok(!plain.A.weapons.some((w) => w.name === 'Plasma Carbine'));

  /** @type {AppState} */
  let s = {...initialState(), matchup: {...initialState().matchup, A: corax, B: chaksa}};
  s = reduce(s, setUpgrade(army, s, 'A', {ball: t.ball.indexOf('Plasma Carbine')}));
  const plasma = at(s.matchup.A).A.weapons.find((w) => w.name === 'Plasma Carbine');
  assert.ok(plasma);
  // No kind: a plain weapon pick.
  s = reduce(s, /** @type {import('../types.js').Action} */ ({type: 'pickWeapon', side: 'A', key: plasma.key}));
  assert.equal(at(s.matchup.A).A.resolved?.weapon?.name, 'Plasma Carbine');
  // The TacBall pick goes: so does its weapon, back to the default.
  s = reduce(s, setUpgrade(army, s, 'A', {ball: null}));
  assert.equal(s.matchup.A.weaponKey, null);
  assert.equal(at(s.matchup.A).A.resolved?.weapon?.key, plain.A.resolved?.weapon?.key);

  s = reduce(s, setUpgrade(army, s, 'A', {upgrade: t.chart.indexOf('BS+1')}));
  const v = at(s.matchup.A);
  assert.ok(v.A.resolved?.profile && plain.A.resolved?.profile && v.ledger);
  assert.equal(v.A.resolved.profile.bs, plain.A.resolved.profile.bs + 1);
  assert.deepEqual(/** @type {Section} */ (/** @type {LedgerSide} */ (v.ledger.ledger.A).sv).lines[0], {value: plain.A.resolved.profile.bs + 1, label: 'BS (Team-Ops: BS+1)', by: null});
});

test('a Stun Pistol: its target can only be Stunned, however many wounds it has', () => {
  const magistrate = {...EMPTY_SIDE, unitId: /** @type {import('../types.js').UnitRow} */ (army.units.find((x) => x.slug === 'bca-magistrates')).id, factionId: 101, groupId: 1, optionId: 1};
  const plain = matchupView(army, {A: magistrate, B: chaksa, rangeCm: 20});
  const stun = plain.A.weapons.find((w) => w.name === 'Stun Pistol');
  assert.ok(stun, 'the Stun Pistol is a weapon button');
  const v = matchupView(army, {A: {...magistrate, weaponKey: stun.key}, B: chaksa, rangeCm: 20});
  assert.ok(v.targets?.active && v.targets.reactive && v.ledger);
  assert.deepEqual(v.targets.active.map((t) => t.label), ['Stunned']);
  assert.notDeepEqual(v.targets.reactive.map((t) => t.label), ['Stunned']);
  assert.ok(v.ledger.notes.includes('Active: Stun Pistol; a failed save leaves the target Stunned, not wounded'));
});

test('a Team-Ops Jammer: Reset shows against it, and its target can only be Isolated', () => {
  const u = army.units.find((x) => x.slug === 'confessor-team-ops');
  assert.ok(u && u.upgrades);
  const f = u.inFactions[0];
  const g = u.byFaction[f].groups.find((x) => /Heavy/i.test(/** @type {string} */ (x.isc)));
  assert.ok(g);
  const A = {...EMPTY_SIDE, unitId: u.id, factionId: f, groupId: g.id, optionId: g.options[0].id, ball: u.upgrades.ball.findIndex((i) => i.label === 'Jammer')};
  const plain = matchupView(army, {A, B: chaksa, rangeCm: 20});
  assert.ok(!plain.B.groups.some((x) => x.w?.kind === 'reset'), 'no Reset against a shot');
  const jam = plain.A.weapons.find((w) => w.name === 'Jammer');
  assert.ok(jam, 'the Jammer is a weapon button');
  const v = matchupView(army, {A: {...A, weaponKey: jam.key}, B: chaksa, rangeCm: 20});
  assert.ok(v.B.groups.some((x) => x.w?.kind === 'reset'));
  assert.ok(v.targets?.active && v.ledger);
  assert.deepEqual(v.targets.active.map((t) => t.label), ['Isolated']);
  assert.ok(!v.ledger.notes.some((n) => n.includes('Not rolled')));
  const reset = matchupView(army, {A: {...A, weaponKey: jam.key}, B: {...chaksa, weaponKey: 'reset'}, rangeCm: 20});
  assert.ok(reset.ledger && reset.params && reset.B.resolved?.profile);
  assert.equal(/** @type {LedgerSide} */ (reset.ledger.ledger.B).kind, 'reset');
  assert.equal(reset.params.successValueB, reset.B.resolved.profile.wip);
});

test('a language change renders the same core again: the rules are not re-applied', () => {
  const core = matchupCore(army, {A: corax, B: {...chaksa, inCover: true}, rangeCm: 40});
  const en = renderMatchup(core);
  const esView = renderMatchup(core, translator(es, 'es'));
  // The core is untouched and shared: the rules' output is one object both renders read.
  assert.equal(en.params, core.params);
  assert.equal(esView.params, core.params);
  assert.equal(en.derived, core.derived, 'the view hands the core\'s derivation through untouched');
  assert.ok(core.derived && esView.ledger && en.ledger && en.targets?.active);
  assert.equal(typeof core.derived.notes[0], 'object', 'the core keeps descriptors');
  // Only the words differ.
  assert.notDeepEqual(esView.ledger.notes, en.ledger.notes);
  const esSv = /** @type {Section} */ (/** @type {LedgerSide} */ (esView.ledger.ledger.B).sv);
  const enSv = /** @type {Section} */ (/** @type {LedgerSide} */ (en.ledger.ledger.B).sv);
  assert.deepEqual(esSv.lines.map((l) => l.value), enSv.lines.map((l) => l.value));
  assert.notDeepEqual(esSv.lines.map((l) => l.label), enSv.lines.map((l) => l.label));
  assert.equal(typeof en.ledger.notes[0], 'string');
  assert.equal(typeof en.targets.active[0].label, 'string');
  // matchupView is the two passes composed.
  assert.deepEqual(matchupView(army, {A: corax, B: {...chaksa, inCover: true}, rangeCm: 40}), en);
});

test('the side view holds the allies in contact to what fits, as the CC Attack counts them', () => {
  const cc = /** @type {import('../types.js').WeaponGroup} */ (matchupCore(army, {A: corax, B: chaksa, rangeCm: 40}).A.groups.find((g) => g.w.kind === 'cc')).w;
  const v = matchupCore(army, {A: {...corax, weaponKey: cc.key, ccAllies: 99}, B: chaksa, rangeCm: 40}).A;
  assert.ok(v.ccAlliesMax > 0);
  assert.equal(v.ccAllies, v.ccAlliesMax);
  // Not CC attacking: no allies count.
  assert.equal(matchupCore(army, {A: {...corax, ccAllies: 3}, B: chaksa, rangeCm: 40}).A.ccAllies, 0);
});

// Supportware (rules/supportware.js): a Pathfinder Dronbot (REM) in
// PanOceania, which fields EVO hackers; a Vystrel (REM) in Ariadna, which
// doesn't; a Fusilier (no REM).
/**
 * @param {import('../types.js').UnitRow} unit
 * @param {number} factionId
 * @param {Partial<import('../types.js').Selection>} [over]
 */
const first = (unit, factionId, over = {}) => {
  const group = unit.byFaction[factionId].groups[0];
  return {...EMPTY_SIDE, unitId: unit.id, factionId, groupId: group.id, profileId: group.profiles[0].id, optionId: group.options[0].id, ...over};
};

test('Supportware: the side card offers the chips that change the pick, the saved roll names the one in use', () => {
  const pathfinder = first(unitByIsc('Pathfinder Dronbot'), 101, {weaponKey: '33:', supportware: 'enhancedReaction'});
  const matchup = {A: first(unitByIsc('Fusiliers'), 101), B: pathfinder, rangeCm: 40};
  const view = matchupView(army, matchup);
  assert.deepEqual(view.B.supportware, ['assistedFire', 'enhancedReaction']);
  assert.deepEqual(view.A.supportware, []);
  assert.equal(view.params?.burstB, 2);
  assert.match(matchupRollSummary(view, null).setup, /Enhanced Reaction/);
  // Its Flash Pulse is B1: Enhanced Reaction can't raise it, so no chip, and it isn't named.
  const pulse = matchupView(army, {...matchup, B: {...pathfinder, weaponKey: '72:'}});
  assert.deepEqual(pulse.B.supportware, ['assistedFire']);
  assert.doesNotMatch(matchupRollSummary(pulse, null).setup, /Enhanced Reaction/);
  // Ariadna has no EVO hacker: no chips.
  assert.deepEqual(matchupView(army, {...matchup, B: first(unitByIsc('Vystrel Mobile Artillery Regiment'), 301)}).B.supportware, []);
});
