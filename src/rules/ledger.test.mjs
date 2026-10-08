// Run with: yarn test:js
// "How the dice were built" must add up: for a broad sample of real matchups,
// every total in the ledger equals the calculator input deriveInputs produced,
// with no unexplained "other rules" line.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ammoTag, buildLedger} from './ledger.js';
import {deriveInputs} from './matchup.js';
import {RANGE_BANDS} from './ranges.js';
import {pseudoWeapons, resolveSelection, trooperWeapons} from './trooper.js';

const army = JSON.parse(readFileSync(new URL('../army/army.json', import.meta.url), 'utf8'));

// Seeded, so a failure always reproduces.
let seed = 11;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pickOne = (list) => list[Math.floor(rand() * list.length)];

// A random trooper: unit, faction, group, loadout and one of its weapons (or Dodge).
function randomSide(side) {
  for (;;) {
    const unit = pickOne(army.units);
    const factionId = Number(pickOne(Object.keys(unit.byFaction)));
    const group = pickOne(unit.byFaction[factionId].groups);
    const option = pickOne(group.options);
    const sel = {unitId: unit.id, factionId, groupId: group.id, profileId: group.profiles[0].id, optionId: option.id,
      inCover: rand() < 0.4, surpriseAttack: rand() < 0.5, ftSize: pickOne([1, 1, 2, 3, 4, 5])};
    const r = resolveSelection(army, sel);
    const weapons = trooperWeapons(r.option, army.weapons, r.traits);
    const choices = [...weapons, ...pseudoWeapons(r.profile, r.traits, side)];
    const w = rand() < 0.85 && weapons.length ? pickOne(weapons) : pickOne(choices);
    return resolveSelection(army, {...sel, weaponKey: w.key});
  }
}

function checkSection(where, sec, expected) {
  if (!sec) return;
  assert.equal(sec.total, expected, `${where} total`);
  const unexplained = sec.lines.filter((l) => l.label === 'other rules');
  assert.deepEqual(unexplained, [], `${where}: ${JSON.stringify(sec.lines)}`);
  const sum = sec.lines.filter((l) => !l.struck && typeof l.value === 'number').reduce((a, l) => a + l.value, 0);
  if (!sec.lines.some((l) => l.value === '—')) assert.equal(sum, sec.total, `${where} lines add up`);
}

test('ledger totals match deriveInputs and are fully explained', () => {
  let checked = 0;
  for (let i = 0; i < 1500; i++) {
    const active = randomSide('A');
    const reactive = randomSide('B');
    const rangeCm = pickOne(RANGE_BANDS).to;
    const derived = deriveInputs({active, reactive, rangeCm});
    if (!derived.ok) continue;
    const {inputs} = derived;
    const ledger = buildLedger({active, reactive, rangeCm, inputs});
    const where = (s) => `#${i} ${s} ${active.unit.isc} ${active.weapon.key} vs ${reactive.unit.isc} ${reactive.weapon.key} @${rangeCm}`;
    for (const s of ['A', 'B']) {
      const l = ledger[s];
      if (!l || l.kind === 'none') continue;
      if (l.sv) checkSection(`${where(s)} SV`, l.sv, inputs[`successValue${s}`]);
      if (l.burst) checkSection(`${where(s)} B`, l.burst, inputs[`burst${s}`]);
      if (l.sd) checkSection(`${where(s)} SD`, l.sd, inputs[`bonusBurst${s}`] ?? 0);
      if (l.save) checkSection(`${where(s)} PS`, l.save, inputs[`damage${s}`] + inputs[`arm${s === 'A' ? 'B' : 'A'}`]);
    }
    checked++;
  }
  assert.ok(checked > 800, `only ${checked} valid matchups sampled`);
});

test('dice line reads like the results: B, SV and the save value', () => {
  const find = (isc) => army.units.find((u) => u.isc.startsWith(isc));
  const side = (isc, weaponName, extra = {}) => {
    const unit = find(isc);
    const factionId = Number(Object.keys(unit.byFaction)[0]);
    const group = unit.byFaction[factionId].groups[0];
    const option = group.options.find((o) => o.weapons.some((w) => w.name === weaponName));
    const sel = {unitId: unit.id, factionId, groupId: group.id, profileId: group.profiles[0].id, optionId: option.id, ftSize: 1, ...extra};
    const r = resolveSelection(army, sel);
    const w = trooperWeapons(r.option, army.weapons, r.traits).find((x) => x.name === weaponName);
    return resolveSelection(army, {...sel, weaponKey: w.key});
  };
  const active = side('Fusiliers', 'Combi Rifle');
  const reactive = side('Fusiliers', 'Combi Rifle', {inCover: true});
  const derived = deriveInputs({active, reactive, rangeCm: 40});
  const ledger = buildLedger({active, reactive, rangeCm: 40, inputs: derived.inputs});
  assert.match(ledger.A.dice, /^B3 SV\d+ PS\d+$/);
  assert.ok(ledger.A.sv.lines.some((l) => l.label === 'cover' && l.by === 'B' && l.value === -3));
  assert.ok(ledger.A.save.lines.some((l) => l.label === 'cover' && l.by === 'B' && l.value === 3));
  assert.ok(ledger.B.burst.lines.some((l) => l.label === 'ARO: one die'));
});

test('ammo tag: N never shown, Plasma, Cont, Blast, in the order players write them', () => {
  const rows = Object.values(army.weapons).flat();
  const row = (name, mode = null) => rows.find((r) => r.name === name && (mode === null || r.mode === mode));
  assert.equal(ammoTag(row('Combi Rifle'), {}), '');
  assert.equal(ammoTag(row('Light Flamethrower'), {}), ' Cont');
  assert.equal(ammoTag(row('AP Heavy Machine Gun'), {}), ' AP');
  assert.equal(ammoTag(row('Missile Launcher', 'Hit Mode'), {}), ' AP EXP');
  assert.equal(ammoTag(row('Missile Launcher', 'Blast Mode'), {}), ' EXP Blast');
  assert.equal(ammoTag(row('Plasma Rifle', 'Hit Mode'), {}), ' Plasma');
  assert.equal(ammoTag(row('Plasma Rifle', 'Blast Mode'), {}), ' Plasma Blast');
  assert.equal(ammoTag(row('Combi Rifle'), {forceAP: true, cont: true}), ' AP Cont');
});

test('BS Attack (SR-n) is its own line under the weapon PS, from the attacker', () => {
  // Cutter (TAG, BS Attack (SR-1)) with its MULTI HMG in AP Mode, vs Fusiliers.
  const pick = (sel) => resolveSelection(army, sel);
  const cutter = pick({unitId: 12, factionId: 101, groupId: 1, optionId: 1});
  const hmg = trooperWeapons(cutter.option, army.weapons, cutter.traits).find((w) => w.id === 4 && /^AP/.test(w.mode));
  const active = pick({unitId: 12, factionId: 101, groupId: 1, optionId: 1, weaponKey: hmg.key});
  const reactive = pick({unitId: 1, factionId: 101, groupId: 1, optionId: 1, weaponKey: '33:'});
  const derived = deriveInputs({active, reactive, rangeCm: 80});
  const save = buildLedger({active, reactive, rangeCm: 80, inputs: derived.inputs}).A.save;
  assert.deepEqual(save.lines.slice(0, 2).map((l) => [l.value, l.label, l.by]), [[5, 'PS', null], [-1, 'BS Attack (SR-1)', 'A']]);
  assert.equal(save.lines.some((l) => l.label === 'other rules'), false);
});

test('AMMO: the weapon\'s own ammo, then each addition with its source', () => {
  const side = (unitId, factionId, groupId, optionId) => {
    const sel = {unitId, factionId, groupId, optionId};
    const r = resolveSelection(army, sel);
    const w = trooperWeapons(r.option, army.weapons, r.traits)[0];
    return resolveSelection(army, {...sel, weaponKey: w.key});
  };
  const target = resolveSelection(army, {unitId: 1, factionId: 101, groupId: 1, optionId: 1, weaponKey: '33:'});
  const ammo = (x) => {
    const derived = deriveInputs({active: x, reactive: target, rangeCm: 40});
    const a = buildLedger({active: x, reactive: target, rangeCm: 40, inputs: derived.inputs}).A.ammo;
    return {lines: a.lines.map((l) => [l.value, l.label, l.by ?? l.source ?? null]), total: a.total};
  };
  // Bashi Bazouks: BS Attack (AP) adds AP, from the trooper.
  const bashi = ammo(side(325, 401, 1, 2));
  assert.deepEqual(bashi.lines.slice(1), [['+', 'AP', 'A']]);
  assert.deepEqual(bashi.lines[0], ['', 'T2', null]);                 // the weapon's own
  assert.equal(bashi.total, 'T2+AP');
  // Agamemnon: BS Attack (Continuous Damage).
  assert.deepEqual(ammo(side(1594, 702, 1, 1)).lines.slice(1).at(-1), ['+', 'CONT', 'A']);
  // Corax-1: the loadout's Viral.
  assert.deepEqual(ammo(side(1934, 603, 1, 4)).lines.slice(1), [['+', 'Viral (DA+Shock)', 'loadout']]);
  // A plain Combi Rifle: N, nothing added.
  assert.deepEqual(ammo(target), {lines: [['', 'N', null]], total: 'N'});
});
