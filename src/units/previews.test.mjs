import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewCandidates, woundsFor} from './previews.js';
import {PARAM_KEYS, paramsKey} from '../engine/params.js';
import {bsWeapons} from './profileToInputs.js';

const army = JSON.parse(readFileSync(new URL('../data/army.json', import.meta.url), 'utf8'));
const byIsc = (isc) => army.units.find((u) => u.isc === isc);
const hatamoto = byIsc('Hatamoto Imperial Guard');
const sierra = byIsc('Sierra Dronbot');
const sierraOption = sierra.byFaction['107'].groups[0].options[0];
const hmgKey = bsWeapons(sierraOption, army.weapons).find((w) => /Machine Gun/.test(w.name)).key;

const selA = {unitId: hatamoto.id, factionId: 1102, optionId: 1, weaponKey: '111:Hit Mode', inCover: false};
const selB = {unitId: sierra.id, factionId: 107, optionId: sierraOption.id, weaponKey: hmgKey, inCover: false};

test('candidates cover every BS weapon of the loadout with full params', () => {
  const cands = previewCandidates({army, side: 'A', selX: selA, selY: selB, rangeCm: 40});
  assert.equal(cands.length, 3);
  for (const c of cands) {
    assert.ok(c.params, c.weaponKey);
    assert.deepEqual(Object.keys(c.params).sort(), [...PARAM_KEYS].sort());
    assert.equal(c.side, 'A');
  }
  const hit = cands.find((c) => c.weaponKey === '111:Hit Mode');
  assert.equal(hit.params.ammoA, 'PLASMA');
  assert.equal(hit.params.burstB, 4);
});

test("changing the other side's choice changes the candidate params", () => {
  const base = previewCandidates({army, side: 'A', selX: selA, selY: selB, rangeCm: 40});
  const covered = previewCandidates({army, side: 'A', selX: selA, selY: {...selB, inCover: true}, rangeCm: 40});
  assert.notEqual(base[0].key, covered[0].key);
  assert.equal(covered[0].params.armB, base[0].params.armB + 3);
  assert.equal(covered[0].params.successValueA, base[0].params.successValueA - 3);
});

test('reactive candidates use the active weapon as the opponent', () => {
  const cands = previewCandidates({army, side: 'B', selX: selB, selY: selA, rangeCm: 40});
  assert.equal(cands.length, 1);
  assert.equal(cands[0].side, 'B');
  assert.equal(cands[0].params.ammoA, 'PLASMA');
  assert.equal(cands[0].params.burstB, 4);
  // Same matchup from the active side has identical params but must not share a cache entry.
  const fromA = previewCandidates({army, side: 'A', selX: selA, selY: selB, rangeCm: 40}).find((c) => c.weaponKey === '111:Hit Mode');
  assert.equal(paramsKey(fromA.params), paramsKey(cands[0].params));
  assert.notEqual(fromA.key, cands[0].key);
});

test('no params without an opposing weapon; out-of-range weapons preview as always failing', () => {
  const noWeapon = previewCandidates({army, side: 'A', selX: selA, selY: {...selB, weaponKey: null}, rangeCm: 40});
  assert.ok(noWeapon.length > 0);
  assert.ok(noWeapon.every((c) => c.params === null));
  // 24-32": Heavy Pistol (max 24") is out, Plasma Carbine (max 40") is in.
  const far = previewCandidates({army, side: 'A', selX: selA, selY: selB, rangeCm: 80});
  const pistol = far.find((c) => c.weaponKey === '107:');
  assert.equal(pistol.params.successValueA, 0);
  // BS13, -3 range cancelled by X Visor.
  assert.equal(far.find((c) => c.weaponKey === '111:Hit Mode').params.successValueA, 13);
});

test('woundsFor sums wounds × chance for one player', () => {
  const value = {expected_wounds: [
    {player: 'active', wounds: 0, chance: 0.5},
    {player: 'active', wounds: 1, chance: 0.3},
    {player: 'active', wounds: 2, chance: 0.1},
    {player: 'fail', wounds: 0, chance: 0.05},
    {player: 'reactive', wounds: 1, chance: 0.05},
  ]};
  assert.ok(Math.abs(woundsFor(value, 'A') - 0.5) < 1e-9);
  assert.ok(Math.abs(woundsFor(value, 'B') - 0.05) < 1e-9);
});
