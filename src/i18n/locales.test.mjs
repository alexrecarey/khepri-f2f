import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import en from './en.js';
import es from './es.js';
import {translator, tEn} from './index.js';

const LOCALES = {es};
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const tags = (text) => [...text.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort();
// A plural key's forms count as the key itself: "x_one", "x_other" -> "x".
const base = (key) => key.replace(/_(zero|one|two|few|many|other)$/, '');

for (const [lang, messages] of Object.entries(LOCALES)) {
  test(`${lang} has every English message and nothing else`, () => {
    const want = new Set(Object.keys(en).map(base));
    const have = new Set(Object.keys(messages).map(base));
    assert.deepEqual([...want].filter((k) => !have.has(k)), [], 'missing');
    assert.deepEqual([...have].filter((k) => !want.has(k)), [], 'not in English');
  });

  test(`${lang} keeps each message's placeholders and markup`, () => {
    for (const [key, text] of Object.entries(messages)) {
      const source = en[key] ?? en[`${base(key)}_other`];
      assert.deepEqual(placeholders(text), placeholders(source), key);
      assert.deepEqual(tags(text), tags(source), key);
    }
  });
}

test('Spanish Attributes are the Army\'s own (names.es.json stats)', () => {
  const {stats} = JSON.parse(readFileSync(new URL('../army/names.es.json', import.meta.url), 'utf8'));
  const key = {move: 'mov'};
  for (const [stat, name] of Object.entries(stats)) {
    if (stat === 'ava') continue;
    assert.equal(es[`stat.${key[stat] ?? stat}`], name, stat);
  }
});

test('t fills placeholders, picks the plural form and falls back to English', () => {
  const t = translator({'a.b_one': '{count} uno', 'a.b_other': '{count} varios'}, 'es');
  assert.equal(t('a.b', {count: 1}), '1 uno');
  assert.equal(t('a.b', {count: 3}), '3 varios');
  assert.equal(t('state.dead'), 'Dead');
  assert.equal(t('no.such.key'), 'no.such.key');
  assert.equal(tEn('ledger.fireteam', {size: 4}), 'Fireteam 4');
});

test('t.term reads the army\'s display maps, or keeps the English token', () => {
  const t = translator(es, 'es', {extras: {'+1B': '+1R'}, modes: {17: {'CC Mode': 'Arma CC'}}});
  assert.equal(t.term('extras', '+1B'), '+1R');
  assert.equal(t.term('extras', 'AP'), 'AP');
  assert.equal(t.term('modes', 'CC Mode', 17), 'Arma CC');
  assert.equal(t.term('modes', 'CC Mode', 147), 'CC Mode');
});

test('distances: English in inches, Spanish in centimetres', () => {
  const t = translator(es, 'es');
  assert.equal(tEn.distance(80), 32);
  assert.equal(t.distance(80), 80);
  assert.equal(tEn('dist.value', {n: tEn.distance(240)}), '96"');
  assert.equal(t('dist.value', {n: t.distance(240)}), '240 cm');
  assert.equal(tEn.inchText('MOV 6-4", Dodge (+3)'), 'MOV 6-4", Dodge (+3)');
  assert.equal(t.inchText('MOV 6-4", Dodge (+3)'), 'MOV 15-10 cm, Dodge (+3)');
  assert.equal(t.inchText('+2"'), '+5 cm');
});
