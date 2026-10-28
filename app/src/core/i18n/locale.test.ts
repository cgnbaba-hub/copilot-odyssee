import { langFromCulture, localize } from './locale';

describe('langFromCulture', () => {
  it('maps German cultures to de', () => {
    expect(langFromCulture('de-CH')).toBe('de');
    expect(langFromCulture('de-de')).toBe('de');
  });

  it('falls back to en for everything else', () => {
    expect(langFromCulture('fr-CH')).toBe('en');
    expect(langFromCulture('en-US')).toBe('en');
    expect(langFromCulture(undefined)).toBe('en');
  });
});

describe('localize', () => {
  it('returns the requested language', () => {
    expect(localize({ de: 'Insel', en: 'Island' }, 'en')).toBe('Island');
  });
});
