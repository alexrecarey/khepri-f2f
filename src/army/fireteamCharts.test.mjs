import test from 'node:test';
import assert from 'node:assert/strict';
import {fireteamChartsFile} from './fireteamCharts.js';

test('charts file: armies in id order, charts unchanged, null where an army has none', () => {
  const chart = {spec: {CORE: 1, HARIS: 1, DUO: 2}, desc: '', teams: [{type: ['CORE'], units: [{name: 'ORC', max: 5, slug: 'orc-troops'}]}]};
  const files = new Map([[1002, {fireteamChart: chart}], [101, {}]]);
  const out = fireteamChartsFile(files, '2026-11-25T00:00:00.000Z');
  assert.equal(out.generatedAt, '2026-11-25T00:00:00.000Z');
  assert.deepEqual(Object.keys(out.charts), ['101', '1002']);
  assert.equal(out.charts[1002], chart);
  assert.equal(out.charts[101], null);
});
