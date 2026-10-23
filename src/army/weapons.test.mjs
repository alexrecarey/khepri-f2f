// Run with: yarn test:js
// Every weapon entry carries one `kind` (WEAPON_KINDS), set where it is built,
// over the whole committed army.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {trooperPrograms} from './hacking.js';
import {effectiveTraits} from './traits.js';
import {WEAPON_KINDS, bsWeapons, ccWeapons, isPseudo, isTemplate, rolls} from './weapons.js';
import {pseudoWeapons} from '../rules/trooper.js';

const army = JSON.parse(readFileSync(new URL('./army.json', import.meta.url), 'utf8'));

test('every entry has a kind in WEAPON_KINDS; template iff a Direct Template, cc / program / pseudo by list', () => {
  const seen = new Set();
  const check = (w, allowed) => {
    assert.ok(WEAPON_KINDS.includes(w.kind), `${w.key}: kind ${w.kind}`);
    assert.ok(allowed.includes(w.kind), `${w.key}: ${w.kind} not in ${allowed}`);
    assert.equal(w.kind === 'template', isTemplate(w.row), `${w.key}: template iff Direct Template`);
    assert.equal('pseudo' in w || 'cc' in w || 'hacking' in w, false, `${w.key}: the old flags are gone`);
    seen.add(w.kind);
  };
  for (const u of army.units) {
    for (const {groups} of Object.values(u.byFaction)) {
      for (const g of groups) {
        for (const o of g.options) {
          const traits = effectiveTraits(g.profiles[0], o);
          for (const w of bsWeapons(o, army.weapons)) check(w, ['bs', 'template']);
          for (const w of ccWeapons(o, army.weapons)) check(w, ['cc']);
          for (const w of trooperPrograms(traits, army.lang)) check(w, ['program']);
          for (const w of pseudoWeapons(traits, 'B')) check(w, ['dodge', 'reset', 'none']);
        }
      }
    }
  }
  assert.deepEqual([...seen].sort(), [...WEAPON_KINDS].sort(), 'the army exercises every kind');
});

test('isPseudo and rolls split the kinds', () => {
  assert.deepEqual(WEAPON_KINDS.filter((kind) => isPseudo({kind})), ['dodge', 'reset', 'none']);
  assert.deepEqual(WEAPON_KINDS.filter((kind) => rolls({kind})), ['bs', 'cc', 'program', 'dodge', 'reset']);
  assert.equal(isPseudo(undefined), false);
  assert.equal(rolls(null), false);
});
