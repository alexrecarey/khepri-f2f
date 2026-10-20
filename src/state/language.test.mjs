import test from 'node:test';
import assert from 'node:assert/strict';
import {languageChoice, resolveLanguage} from './language.js';

test('a language picked in Settings wins over the browser', () => {
  assert.equal(resolveLanguage('en', ['es-ES']), 'en');
  assert.equal(resolveLanguage('es', ['en-US']), 'es');
});

test('otherwise the first browser language the app has', () => {
  assert.equal(resolveLanguage('auto', ['es-AR', 'en']), 'es');
  assert.equal(resolveLanguage(undefined, ['fr-FR', 'es', 'en']), 'es');
  assert.equal(resolveLanguage('auto', ['en-GB', 'es']), 'en');
});

test('English when nothing matches', () => {
  assert.equal(resolveLanguage('auto', ['fr', 'de-DE']), 'en');
  assert.equal(resolveLanguage('klingon', []), 'en');
});

test('Settings shows Automatic unless a known language was picked', () => {
  assert.equal(languageChoice({}), 'auto');
  assert.equal(languageChoice({language: 'xx'}), 'auto');
  assert.equal(languageChoice({language: 'es'}), 'es');
});
