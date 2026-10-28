import { RubricCriterion } from '../content/types';

/**
 * Rule-based feedback for the prompt workshop. It looks for typical signals
 * of each criterion in German and English. The prompt text never leaves the
 * browser and is not stored.
 */

const SIGNALS: Record<RubricCriterion, string[]> = {
  goal: [
    'erstell', 'schreib', 'verfass', 'fasse', 'formulier', 'entwirf', 'entwerf', 'analysier', 'liste', 'erklär',
    'vergleich', 'übersetz', 'gib mir', 'mach', 'plane', 'finde', 'identifizier', 'generier', 'überarbeit',
    'korrigier', 'kürze', 'bereite', 'beantworte', 'antworte', 'verbessere', 'schlage', 'create', 'write', 'draft',
    'summari', 'analy', 'list ', 'explain', 'compare', 'translate', 'give me', 'make', 'plan ', 'find', 'identify',
    'generate', 'rewrite', 'revise', 'shorten', 'prepare', 'answer', 'reply', 'improve', 'suggest'
  ],
  context: [
    'für ', 'fuer ', ' an ', 'zielgruppe', 'weil', 'damit', 'team', 'kund', 'kolleg', 'vorgesetzt',
    'geschäftsleitung', 'projekt', 'neue', 'meeting', 'gast', 'gäste', 'zielgruppe', 'for ', 'audience', 'because',
    'so that', 'customer', 'colleague', 'manager', 'project', 'leadership', 'new ', 'guest'
  ],
  source: [
    'datei', 'dokument', 'anhang', 'tabelle', 'verlauf', 'notizen', 'protokoll', 'präsentation',
    'basierend', 'grundlage', 'aus der', 'aus dem', 'quelle', 'eingefügt', 'daten', '/', 'file', 'document',
    'attachment', 'table', 'sheet', 'thread', 'notes', 'minutes', 'based on', 'from the', 'source', 'pasted', 'data'
  ],
  expectation: [
    'wörter', 'woerter', 'zeichen', 'sätze', 'saetze', 'absatz', 'absätze', 'stichpunkt', 'aufzählung', 'liste',
    'tabelle', 'folie', 'seite', 'ton', 'stil', 'format', 'länge', 'kurz', 'formell', 'locker', 'words',
    'characters', 'sentence', 'paragraph', 'bullet', 'list', 'table', 'slide', 'page', 'tone', 'style', 'length',
    'short', 'formal', 'casual'
  ]
};

/** Below this many words a prompt rarely carries enough information. */
const MIN_WORDS = 8;
const SHORT_PROMPT_MAX_SCORE = 30;

export interface PromptFeedback {
  /** 0–100 */
  score: number;
  met: RubricCriterion[];
  missing: RubricCriterion[];
  tooShort: boolean;
}

function hasSignal(text: string, criterion: RubricCriterion): boolean {
  if (criterion === 'expectation' && /\d/.test(text)) return true;
  return SIGNALS[criterion].some((signal) => text.indexOf(signal) >= 0);
}

export function evaluatePrompt(prompt: string, rubric: RubricCriterion[]): PromptFeedback {
  const text = ` ${prompt.toLowerCase().replace(/\s+/g, ' ')} `;
  const words = prompt.split(/\s+/).filter((w) => w.length > 0).length;
  const met = rubric.filter((criterion) => hasSignal(text, criterion));
  const missing = rubric.filter((criterion) => met.indexOf(criterion) < 0);
  const tooShort = words < MIN_WORDS;

  let score = rubric.length === 0 ? 0 : Math.round((met.length / rubric.length) * 100);
  if (tooShort) score = Math.min(score, SHORT_PROMPT_MAX_SCORE);
  return { score, met, missing, tooShort };
}
