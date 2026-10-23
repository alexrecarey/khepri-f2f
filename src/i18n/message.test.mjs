// Run with: yarn test:js
import test from 'node:test';
import assert from 'node:assert/strict';
import {tEn, translator} from './index.js';
import es from './es.js';
import {distance, inch, list, msg, render, renderLines, side, term} from './message.js';

const tEs = translator(es, 'es', {extras: {'+1B': '+1R'}, modes: {58: {'Hit Mode': 'Modo Impacto'}}});

test('render: a string, a number and null pass through unchanged', () => {
  assert.equal(render(tEn, 'Combi Rifle'), 'Combi Rifle');
  assert.equal(render(tEn, -3), -3);
  assert.equal(render(tEn, null), null);
  assert.equal(render(tEn, undefined), undefined);
});

test('render: a message with plain and nested params, in each language', () => {
  const m = msg('note.side', {side: msg('side.active'), text: msg('skill.bsAttackMod', {mod: -3})});
  assert.equal(render(tEn, m), 'Active: BS Attack (-3)');
  assert.equal(render(tEs, m), `${es['side.active']}: ${es['skill.bsAttackMod'].replace('{mod}', '-3')}`);
  assert.deepEqual(m, {key: 'note.side', params: {side: {key: 'side.active'}, text: {key: 'skill.bsAttackMod', params: {mod: -3}}}});
});

test('render: the plural form follows a count param', () => {
  assert.equal(render(tEn, msg('state.wounds', {count: 1})), '1 wound');
  assert.equal(render(tEn, msg('state.wounds', {count: 2})), '2 wounds');
});

test('render: a fallback stands in for a key the copy lacks', () => {
  assert.equal(render(tEn, {...msg('ammo.DA'), fallback: 'DA'}), 'DA');
  assert.equal(render(tEn, {...msg('ammo.MYSTERY'), fallback: 'Mystery'}), 'Mystery');
});

test('render: army terms, with and without a scope, optionally stripped', () => {
  assert.equal(render(tEn, term('extras', '+1B')), '+1B');
  assert.equal(render(tEs, term('extras', '+1B')), '+1R');
  assert.equal(render(tEs, term('modes', 'Hit Mode', 58)), 'Modo Impacto');
  assert.equal(render(tEs, {...term('modes', 'Hit Mode', 58), strip: / Mode$|^Modo /i}), 'Impacto');
  assert.equal(render(tEn, {...term('modes', 'Hit Mode', 58), strip: / Mode$|^Modo /i}), 'Hit');
});

test('render: distances and inch text in the language\'s unit', () => {
  assert.equal(render(tEn, distance(60)), 24);
  assert.equal(render(tEs, distance(60)), 60);
  assert.equal(render(tEn, msg('dist.band', {from: distance(40), to: distance(60)})), '16-24"');
  assert.equal(render(tEn, inch('Dodge (+2")')), 'Dodge (+2")');
  assert.equal(render(tEs, inch('Dodge (+2")')), 'Dodge (+5 cm)');
});

test('render: a list joins rendered items; side() wraps a note for one side', () => {
  assert.equal(render(tEn, list([msg('abbr.SR'), -1], '')), 'SR-1');
  assert.equal(render(tEn, list([msg('skill.mimetismMod', {mod: -3}), msg('skill.foxhole')])), 'Mimetism (-3), Foxhole');
  assert.equal(render(tEn, side('B', msg('note.shock'))), `Reactive: ${tEn('note.shock')}`);
  assert.deepEqual(side(null, msg('note.shock')), msg('note.shock'));
});

test('renderLines renders label, struck and source and keeps the rest', () => {
  const lines = [
    {value: -3, label: msg('ledger.cover'), by: 'B', struck: msg('skill.marksmanship')},
    {value: null, text: '+', label: 'AP', by: null, source: msg('ledger.loadout')},
    {value: 1, label: 'Combi Rifle', by: null},
  ];
  assert.deepEqual(renderLines(tEn, lines), [
    {value: -3, label: 'cover', by: 'B', struck: 'Marksmanship'},
    {value: null, text: '+', label: 'AP', by: null, source: 'loadout'},
    {value: 1, label: 'Combi Rifle', by: null},
  ]);
  // Rendering rendered lines changes nothing.
  assert.deepEqual(renderLines(tEn, renderLines(tEn, lines)), renderLines(tEn, lines));
});
