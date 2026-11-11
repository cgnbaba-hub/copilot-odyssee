import { cleanPost, cleanUseCase, PinPost, postMinutesPerMonth, sensitiveHints, sharedUseCases, sortPosts } from './pinboard';

const post = (id: string, likes: number, created: string): PinPost => ({
  id,
  title: id,
  prompt: 'x',
  tool: 'chat',
  created,
  status: 'approved',
  mine: false,
  likes,
  liked: false
});

describe('cleanPost', () => {
  it('trims and accepts a complete post', () => {
    const cleaned = cleanPost({ title: '  Angebot   kürzen ', prompt: ' Kürze diese Angebotsmail auf fünf Sätze. ', tool: 'outlook', showName: false });
    expect(cleaned && cleaned.title).toBe('Angebot kürzen');
    expect(cleaned && cleaned.prompt).toBe('Kürze diese Angebotsmail auf fünf Sätze.');
  });

  it('rejects a missing title or a prompt of a few words', () => {
    expect(cleanPost({ title: 'ab', prompt: 'Kürze diese Angebotsmail auf fünf Sätze.', tool: 'chat', showName: false })).toBeUndefined();
    expect(cleanPost({ title: 'Kurz', prompt: 'Mach das kürzer', tool: 'chat', showName: false })).toBeUndefined();
  });
});

describe('sensitiveHints', () => {
  it('spots mail addresses, phone numbers and IBANs', () => {
    expect(sensitiveHints('Schreib an anna.muster@example.ch')).toEqual(['mail']);
    expect(sensitiveHints('Ruf an: +41 44 123 45 67')).toEqual(['phone']);
    expect(sensitiveHints('Konto CH93 0076 2011 6238 5295 7')).toEqual(['iban']);
    expect(sensitiveHints('Fasse die Mail in 3 Stichpunkten zusammen.')).toEqual([]);
  });
});

describe('sortPosts', () => {
  const posts = [post('alt', 3, '2026-10-01'), post('neu', 1, '2026-10-20'), post('mitte', 3, '2026-10-10')];
  it('puts the most helpful first, newer first on a tie', () => {
    expect(sortPosts(posts, 'popular').map((p) => p.id)).toEqual(['mitte', 'alt', 'neu']);
  });
  it('or simply the newest first', () => {
    expect(sortPosts(posts, 'new').map((p) => p.id)).toEqual(['neu', 'mitte', 'alt']);
  });
});

describe('use cases on the board', () => {
  const card = (extra: Partial<PinPost>): PinPost => ({
    id: '1',
    title: 'T',
    prompt: 'P',
    tool: 'chat',
    created: '',
    status: 'approved',
    mine: false,
    likes: 0,
    liked: false,
    ...extra
  });

  it('keeps only figures that make sense', () => {
    expect(cleanUseCase({ frequency: 'weekly', minutes: '20' })).toEqual({ frequency: 'weekly', minutes: 20 });
    expect(cleanUseCase({ frequency: 'weekly', minutes: 9999 })).toEqual({ frequency: 'weekly', minutes: 600 });
    expect(cleanUseCase({ frequency: 'hourly', minutes: 20 })).toBeUndefined();
    expect(cleanUseCase({ frequency: 'weekly', minutes: 0 })).toBeUndefined();
    expect(cleanUseCase({ frequency: undefined, minutes: undefined })).toBeUndefined();
    expect(cleanUseCase(undefined)).toBeUndefined();
  });

  it('adds up what approved use cases take per month', () => {
    expect(postMinutesPerMonth(card({ useCase: { frequency: 'daily', minutes: 10 } }))).toBe(200);
    expect(postMinutesPerMonth(card({}))).toBe(0);
    const posts = [
      card({ useCase: { frequency: 'daily', minutes: 10 } }),
      card({ useCase: { frequency: 'weekly', minutes: 30 } }),
      card({ useCase: { frequency: 'weekly', minutes: 30 }, status: 'pending' }),
      card({})
    ];
    expect(sharedUseCases(posts)).toEqual({ count: 2, minutesPerMonth: 320 });
  });

  it('carries the use case through cleaning a new post', () => {
    const cleaned = cleanPost({
      title: 'Wochenbericht',
      prompt: 'Fasse meine Notizen der Woche zusammen.',
      tool: 'chat',
      showName: false,
      useCase: { frequency: 'weekly', minutes: 45 }
    });
    expect(cleaned && cleaned.useCase).toEqual({ frequency: 'weekly', minutes: 45 });
  });
});
