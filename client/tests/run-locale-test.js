import translations from '../src/utils/localization.js';
import assert from 'assert';

console.log('Running localization dictionaries alignment test...');

try {
  // 1. Ensure English exists
  assert.ok(translations.en, 'English locale is missing');
  assert.strictEqual(translations.en.appName, 'CivicCompanion');

  // 2. All language dictionaries must contain identical translation keys
  const enKeys = Object.keys(translations.en).sort();
  const locales = ['es', 'hi', 'fr'];

  locales.forEach(loc => {
    assert.ok(translations[loc], `Locale ${loc} is missing`);
    const locKeys = Object.keys(translations[loc]).sort();
    assert.deepStrictEqual(locKeys, enKeys, `Keys for locale ${loc} do not match English locale keys!`);
  });

  console.log('✅ PASS: All localization dictionaries are perfectly aligned!');
} catch (err) {
  console.error('❌ FAIL: Localization alignment test failed!');
  console.error(err);
  process.exit(1);
}
