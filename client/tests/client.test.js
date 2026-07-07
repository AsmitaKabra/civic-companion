import translations from '../src/utils/localization.js';

describe('CivicCompanion Client Localization', () => {
  test('Ensure English dictionary is loaded', () => {
    expect(translations.en).toBeDefined();
    expect(translations.en.appName).toEqual('CivicCompanion');
  });

  test('All language dictionaries must contain identical translation keys (no missing mappings)', () => {
    const enKeys = Object.keys(translations.en).sort();
    const locales = ['es', 'hi', 'fr'];

    locales.forEach(loc => {
      const locKeys = Object.keys(translations[loc]).sort();
      expect(locKeys).toEqual(enKeys);
    });
  });

  test('Verify critical localization tags exist', () => {
    const keysToCheck = [
      'appName',
      'companionTitle',
      'dashGreeting',
      'compReportTitle',
      'schemeTitle',
      'accTitle'
    ];
    
    keysToCheck.forEach(key => {
      expect(translations.en).toHaveProperty(key);
      expect(translations.es).toHaveProperty(key);
      expect(translations.hi).toHaveProperty(key);
      expect(translations.fr).toHaveProperty(key);
    });
  });
});
