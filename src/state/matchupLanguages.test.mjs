// The rules read English tokens only, so a matchup rolls the same dice
// whatever language the names are in.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {splitNames, withNames} from '../army/localize.js';
import {matchupView} from './matchupView.js';
import {EMPTY_SIDE} from './schema.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
const {core} = splitNames(army);
const es = withNames(core, JSON.parse(readFileSync(new URL('../army/names.es.json', import.meta.url), 'utf8')));

// Every loadout of every 7th unit against a fixed set of targets, each weapon.
const sides = army.units.filter((_, i) => i % 7 === 0).flatMap((u) => {
  const [factionId, entry] = Object.entries(u.byFaction)[0];
  return entry.groups.flatMap((g) => g.options.map((o) =>
    ({...EMPTY_SIDE, unitId: u.id, factionId: Number(factionId), groupId: g.id, optionId: o.id})));
});
const targets = sides.filter((_, i) => i % 23 === 0);

test('English and Spanish names give the same engine params and weapons', () => {
  let compared = 0;
  for (const A of sides) {
    for (const B of targets) {
      const en = matchupView(army, {A, B, rangeCm: 40});
      for (const w of en.A.weapons) {
        const sel = {A: {...A, weaponKey: w.key}, B, rangeCm: 40};
        const a = matchupView(army, sel);
        const b = matchupView(es, sel);
        assert.deepEqual(b.params, a.params, `${A.unitId}:${A.optionId} ${w.key} vs ${B.unitId}`);
        assert.deepEqual(b.A.weapons.map((x) => x.key), a.A.weapons.map((x) => x.key));
        compared++;
      }
    }
  }
  assert.ok(compared > 1000, `only ${compared} matchups compared`);
});

test('Spanish names cover every unit, loadout and weapon', () => {
  for (const u of es.units) {
    assert.ok(u.isc && u.name, `unit ${u.id}`);
    for (const e of Object.values(u.byFaction)) for (const g of e.groups) for (const o of g.options) assert.ok(o.name, `${u.id}:${g.id}:${o.id}`);
  }
  assert.equal(es.units.find((u) => u.id === 30).isc, 'Caballero Teutón');
  assert.equal(es.units.find((u) => u.id === 30).code, 'Teutonic Knights');
});
