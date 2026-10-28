import { evaluatePrompt } from './feedback';

describe('evaluatePrompt', () => {
  it('recognises all criteria in a complete German prompt', () => {
    const feedback = evaluatePrompt(
      'Fasse die angehängte Datei für mein Team zusammen, damit alle vor dem Meeting Bescheid wissen. Bitte in 5 Stichpunkten.',
      ['goal', 'context', 'source', 'expectation']
    );
    expect(feedback.missing).toEqual([]);
    expect(feedback.score).toBe(100);
  });

  it('recognises an English prompt', () => {
    const feedback = evaluatePrompt('Write a short thank-you email to the project team for finishing the launch, friendly tone.', [
      'goal',
      'context',
      'expectation'
    ]);
    expect(feedback.score).toBe(100);
  });

  it('names what is missing', () => {
    const feedback = evaluatePrompt('Schreibe einen Text über unser Unternehmen, der neugierig macht und Lust auf mehr weckt.', [
      'goal',
      'expectation'
    ]);
    expect(feedback.met).toEqual(['goal']);
    expect(feedback.missing).toEqual(['expectation']);
    expect(feedback.score).toBe(50);
  });

  it('caps the score of very short prompts', () => {
    const feedback = evaluatePrompt('Schreib eine Mail', ['goal', 'expectation']);
    expect(feedback.tooShort).toBe(true);
    expect(feedback.score).toBeLessThanOrEqual(30);
  });

  it('recognises replies to guests', () => {
    expect(evaluatePrompt('Answer the guest asking whether the transfer is included, in French, at most 5 sentences.', ['goal', 'context', 'expectation']).score).toBe(100);
    expect(evaluatePrompt('Beantworte die Anfrage des Gastes zum Transfer auf Französisch, höflich und in maximal 5 Sätzen.', ['goal', 'context', 'expectation']).score).toBe(100);
  });
});
