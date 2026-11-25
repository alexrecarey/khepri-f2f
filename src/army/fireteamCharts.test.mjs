import test from 'node:test';
import assert from 'node:assert/strict';
import {compareVersions, fireteamChartsSnapshot} from './fireteamCharts.js';

test('versions compare part by part, not as text', () => {
  assert.ok(compareVersions('7.26329.512', '7.26329.98') > 0);
  assert.ok(compareVersions('7.26246.159', '7.26329.478') < 0);
  assert.equal(compareVersions('7.1', '7.1.0'), 0);
});

test('snapshot: armies in id order, charts unchanged, named by the newest army version', () => {
  const chart = {spec: {CORE: 1, HARIS: 1, DUO: 2}, desc: '', teams: [{type: ['CORE'], units: [{name: 'ORC', max: 5, slug: 'orc-troops'}]}]};
  const files = new Map([
    [1002, {version: '7.26329.512', fireteamChart: chart}],
    [101, {version: '7.26329.478'}],
  ]);
  const snap = fireteamChartsSnapshot({101: {name: 'PanOceania', version: '7.26329.478'}}, files, '2026-11-25T00:00:00.000Z');
  assert.equal(snap.version, '7.26329.512');
  assert.deepEqual(Object.keys(snap.armies), ['101', '1002']);
  assert.equal(snap.armies[1002].chart, chart);
  assert.equal(snap.armies[1002].name, '1002');
  assert.equal(snap.armies[101].chart, null);
});
