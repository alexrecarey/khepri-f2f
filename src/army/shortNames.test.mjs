import test from 'node:test';
import assert from 'node:assert/strict';
import {readableCase, spanishShort} from './shortNames.js';

test('names in capitals read as words; particles and codes stay as players write them', () => {
  assert.equal(readableCase('CABALLERO DEL SANTO SEPULCRO'), 'Caballero del Santo Sepulcro');
  assert.equal(readableCase('MED-TEC ÓBSIDON'), 'Med-Tec Óbsidon');
  assert.equal(readableCase('NYOKA FTO'), 'Nyoka FTO');
  assert.equal(readableCase('RACERBOT Mk-III'), 'Racerbot Mk-III');
});

test('a unit goes by what its loadouts share, without role tags', () => {
  assert.equal(spanishShort('Tropas de Asalto NYOKA', ['NYOKA', 'NYOKA FTO', 'NYOKA HACKER']), 'Nyoka');
  assert.equal(spanishShort('SANTA ORDEN MILITAR DE CABALLEROS TEUTONES', ['CABALLERO TEUTÓN', 'CABALLERO TEUTÓN']), 'Caballero Teutón');
  assert.equal(spanishShort('BRIGADIER JACQUES BRUANT, Sous-officier', ['BRIGADIER BRUANT FTO']), 'Brigadier Bruant');
});

test('loadouts that are different troopers fall back to the unit name, else the commonest', () => {
  assert.equal(spanishShort('ALEPH TEAM-OPS', ['CHANDRA-1', 'CHAKORA SPECBOT_1']), 'ALEPH Team-Ops');
  assert.equal(spanishShort('Unidad de Intervención Autónoma ARJUNA', ['ARJUNA', 'ARJUNA', 'KIRANBOT 1']), 'Arjuna');
});
