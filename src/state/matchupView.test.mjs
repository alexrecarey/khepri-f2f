// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pickTrooper, setUpgrade} from './actions.js';
import {matchupView} from './matchupView.js';
import {reduce} from './reduce.js';
import {EMPTY_SIDE, initialState} from './schema.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
// Share-link ids: Corax-1 (Viral) and Chaksa.
const corax = {...EMPTY_SIDE, unitId: 1934, factionId: 603, groupId: 1, optionId: 4};
const chaksa = {...EMPTY_SIDE, unitId: 1310, factionId: 801, groupId: 1, optionId: 1};

test('no weapon picked: each side rolls its default weapon, and the matchup is complete', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.ok(v.A.sel.weaponKey);
  assert.ok(v.B.sel.weaponKey);
  assert.ok(v.complete);
  assert.ok(v.params.burstA >= 1);
  assert.match(v.ledger.ledger.A.dice, /^B\d/);
  // The default is derived, never written back into the document.
  assert.equal(corax.weaponKey, null);
});

test('without the army data the view is empty but keeps the selections', () => {
  const v = matchupView(null, {A: corax, B: chaksa, rangeCm: 40});
  assert.equal(v.ready, false);
  assert.equal(v.complete, false);
  assert.ok(v.hasSelection);
});

test('pickTrooper preselects the weapon the query matched', () => {
  const view = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  const other = view.A.weapons.find((w) => w.key !== view.A.sel.weaponKey);
  const hit = {unitId: 1934, armyFactionId: 603, groupId: 1, profileId: null, optionId: 4, weaponId: other.id};
  const s = reduce(initialState(), pickTrooper(army, 'A', hit));
  assert.equal(army.weapons[other.id] !== undefined, true);
  assert.equal(matchupView(army, s.matchup).A.resolved.weapon.id, other.id);
});

test('side cards: weapon groups, names, faction and the chips that apply', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  for (const s of ['A', 'B']) {
    const side = v[s];
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
  assert.ok(smoke.vis.A && smoke.vis.B);
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
  const v = matchupView(army, {A: kobra, B: chaksa, rangeCm: 40});
  const g = v.A.groups.find((x) => x.id === 221);
  assert.deepEqual(g.modes.map((w) => g.labels.get(w.key)), ['BS', 'CC']);
  assert.ok(v.A.groups.some((x) => x.w.kind === 'cc' && !x.modes));
  // The default stays a shot.
  assert.equal(v.A.resolved.weapon.kind, 'bs');
});

test('Team-Ops chips: the chart and TacBall options show for Team-Ops troopers only', () => {
  const v = matchupView(army, {A: corax, B: chaksa, rangeCm: 40});
  assert.ok(v.A.teamOps.chart.includes('BS+1'));
  assert.ok(v.A.teamOps.ball.includes('Plasma Carbine'));
  assert.equal(v.B.teamOps, null);
});

test('Team-Ops picks: a weapon joins the weapon list, a stat shows in the ledger, dropping it resets the weapon', () => {
  const at = (A) => matchupView(army, {A, B: chaksa, rangeCm: 40});
  const t = at(corax).A.teamOps;
  const plain = at(corax);
  assert.ok(!plain.A.weapons.some((w) => w.name === 'Plasma Carbine'));

  let s = {...initialState(), matchup: {...initialState().matchup, A: corax, B: chaksa}};
  s = reduce(s, setUpgrade(army, s, 'A', {ball: t.ball.indexOf('Plasma Carbine')}));
  const plasma = at(s.matchup.A).A.weapons.find((w) => w.name === 'Plasma Carbine');
  assert.ok(plasma);
  s = reduce(s, {type: 'pickWeapon', side: 'A', key: plasma.key});
  assert.equal(at(s.matchup.A).A.resolved.weapon.name, 'Plasma Carbine');
  // The TacBall pick goes: so does its weapon, back to the default.
  s = reduce(s, setUpgrade(army, s, 'A', {ball: null}));
  assert.equal(s.matchup.A.weaponKey, null);
  assert.equal(at(s.matchup.A).A.resolved.weapon.key, plain.A.resolved.weapon.key);

  s = reduce(s, setUpgrade(army, s, 'A', {upgrade: t.chart.indexOf('BS+1')}));
  const v = at(s.matchup.A);
  assert.equal(v.A.resolved.profile.bs, plain.A.resolved.profile.bs + 1);
  assert.deepEqual(v.ledger.ledger.A.sv.lines[0], {value: plain.A.resolved.profile.bs + 1, label: 'BS (Team-Ops: BS+1)', by: null});
});

test('a Stun Pistol: its target can only be Stunned, however many wounds it has', () => {
  const magistrate = {...EMPTY_SIDE, unitId: army.units.find((x) => x.slug === 'bca-magistrates').id, factionId: 101, groupId: 1, optionId: 1};
  const plain = matchupView(army, {A: magistrate, B: chaksa, rangeCm: 20});
  const stun = plain.A.weapons.find((w) => w.name === 'Stun Pistol');
  assert.ok(stun, 'the Stun Pistol is a weapon button');
  const v = matchupView(army, {A: {...magistrate, weaponKey: stun.key}, B: chaksa, rangeCm: 20});
  assert.deepEqual(v.targets.active.map((t) => t.label), ['Stunned']);
  assert.notDeepEqual(v.targets.reactive.map((t) => t.label), ['Stunned']);
  assert.ok(v.ledger.notes.includes('Active: Stun Pistol; a failed save leaves the target Stunned, not wounded'));
});

test('a Team-Ops Jammer: Reset shows against it, and its target can only be Isolated', () => {
  const u = army.units.find((x) => x.slug === 'confessor-team-ops');
  const f = u.inFactions[0];
  const g = u.byFaction[f].groups.find((x) => /Heavy/i.test(x.isc));
  const A = {...EMPTY_SIDE, unitId: u.id, factionId: f, groupId: g.id, optionId: g.options[0].id, ball: u.upgrades.ball.findIndex((i) => i.label === 'Jammer')};
  const plain = matchupView(army, {A, B: chaksa, rangeCm: 20});
  assert.ok(!plain.B.groups.some((x) => x.w?.kind === 'reset'), 'no Reset against a shot');
  const jam = plain.A.weapons.find((w) => w.name === 'Jammer');
  assert.ok(jam, 'the Jammer is a weapon button');
  const v = matchupView(army, {A: {...A, weaponKey: jam.key}, B: chaksa, rangeCm: 20});
  assert.ok(v.B.groups.some((x) => x.w?.kind === 'reset'));
  assert.deepEqual(v.targets.active.map((t) => t.label), ['Isolated']);
  assert.ok(!v.ledger.notes.some((n) => n.includes('Not rolled')));
  const reset = matchupView(army, {A: {...A, weaponKey: jam.key}, B: {...chaksa, weaponKey: 'reset'}, rangeCm: 20});
  assert.equal(reset.ledger.ledger.B.kind, 'reset');
  assert.equal(reset.params.successValueB, reset.B.resolved.profile.wip);
});
