import { mrzName, MRZ_LENGTH } from './passportLine';

describe('passport name line', () => {
  it('puts the surname first, like a real passport', () => {
    expect(mrzName('Anna Muster', 'X')).toBe('P<CHEMUSTER<<ANNA<<<<<<<<<<<<<<<<<');
    expect(mrzName('Muster, Anna', 'X').indexOf('P<CHEMUSTER<<ANNA')).toBe(0);
  });

  it('spells umlauts out and keeps a fixed length', () => {
    expect(mrzName('Jürg Müller-Höhn', 'X').indexOf('P<CHEMUELLER<HOEHN<<JUERG')).toBe(0);
    expect(mrzName('Maximiliane Alexandra Featherstonehaugh-Wellington', 'X')).toHaveLength(MRZ_LENGTH);
  });

  it('falls back without a name', () => {
    expect(mrzName(undefined, 'Reisende:r').indexOf('P<CHEREISENDE<R')).toBe(0);
  });
});
