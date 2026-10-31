import { shuffled } from './shuffle';

describe('shuffled', () => {
  it('keeps every item exactly once and leaves the input alone', () => {
    const items = ['a', 'b', 'c', 'd'];
    const result = shuffled(items, () => 0.3);
    expect(result.slice().sort()).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('puts the first item elsewhere for other random numbers', () => {
    const firsts = [0, 0.3, 0.6, 0.99].map((r) => shuffled(['a', 'b', 'c', 'd'], () => r).indexOf('a'));
    expect(firsts.some((index) => index !== 0)).toBe(true);
  });
});
