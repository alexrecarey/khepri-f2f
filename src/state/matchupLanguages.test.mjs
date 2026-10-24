// The rules read English tokens only, so a matchup rolls the same dice
// whatever language the names are in.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {splitNames, withNames} from '../army/localize.js';
import {matchupView} from './matchupView.js';
import {EMPTY_SIDE} from './schema.js';
import {translator} from '../i18n/index.js';
import esMessages from '../i18n/es.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));
const {core} = splitNames(army);
const es = withNames(core, JSON.parse(readFileSync(new URL('../army/names.es.json', import.meta.url), 'utf8')), 'es');
// The Spanish copy with the Spanish army's terms, as the app builds it.
const tEs = translator(esMessages, 'es', es.terms);

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
        const b = matchupView(es, sel, tEs);
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
  assert.equal(es.units.find((u) => u.id === 30)?.isc, 'Caballero Teutón');
  assert.equal(es.units.find((u) => u.id === 30)?.code, 'Teutonic Knights');
  // Its Chaksa Peripherals don't name Gorgos Squad.
  const gorgos = es.units.find((u) => u.code === 'Gorgos Squad');
  assert.ok(gorgos);
  assert.equal(gorgos.isc, 'Gorgos');
});

// Every ledger line's number, side and struck state, without the words.
const shape = (ledger) => JSON.stringify(ledger, (key, value) =>
  (key === 'label' || key === 'dice' || key === 'note' || key === 'reason' || key === 'source' ? undefined
    : key === 'struck' ? Boolean(value) : key === 'total' && typeof value === 'string' ? undefined : value));

test('the Spanish ledger has the same lines as the English one, in Spanish', () => {
  let compared = 0;
  for (const A of sides.filter((_, i) => i % 5 === 0)) {
    for (const B of targets) {
      const en = matchupView(army, {A, B, rangeCm: 40});
      for (const w of en.A.weapons) {
        const sel = {A: {...A, weaponKey: w.key}, B, rangeCm: 40, smoke: compared % 3 === 0};
        const a = matchupView(army, sel);
        if (!a.ledger) continue;
        const b = matchupView(es, sel, tEs);
        assert.ok(b.ledger);
        assert.equal(shape(b.ledger.ledger), shape(a.ledger.ledger), `${A.unitId}:${A.optionId} ${w.key} vs ${B.unitId}`);
        assert.equal(b.ledger.notes.length, a.ledger.notes.length);
        for (const side of /** @type {import('../types.js').Side[]} */ (['A', 'B'])) {
          const lines = /** @type {('sv' | 'burst' | 'sd' | 'save')[]} */ (['sv', 'burst', 'sd', 'save']).flatMap((k) => b.ledger?.ledger[side]?.[k]?.lines ?? []);
          for (const l of lines) assert.doesNotMatch(String(l.label), /\b(loadout|range|cover|template)\b/, String(l.label));
          assert.doesNotMatch(b.ledger.ledger[side]?.dice ?? '', /\bSV\d/);
        }
        compared++;
      }
    }
  }
  assert.ok(compared > 200, `only ${compared} ledgers compared`);
});

// The rules' own lines (ARO: one die) and Continuous Damage are told apart by
// flags, not by their English words, so they keep their colour and their
// strike in Spanish too: a reactive CC Attack, with and against CONT.
test('a reactive CC Attack\'s lines match English in Spanish', () => {
  let compared = 0;
  for (const B of sides.filter((_, i) => i % 3 === 0)) {
    for (const A of targets) {
      const en = matchupView(army, {A, B, rangeCm: 20});
      for (const w of en.B.ccWeapons) {
        const sel = {A, B: {...B, weaponKey: w.key}, rangeCm: 20};
        const a = matchupView(army, sel);
        if (!a.ledger) continue;
        const b = matchupView(es, sel, tEs);
        assert.ok(b.ledger);
        assert.equal(shape(b.ledger.ledger), shape(a.ledger.ledger), `${B.unitId}:${B.optionId} ${w.key} vs ${A.unitId}`);
        compared++;
      }
    }
  }
  assert.ok(compared > 100, `only ${compared} ledgers compared`);
});
