/**
 * Mistral AI Integration – Prompt Evaluation Service
 * Rate limit: Max 10 evaluations per user per hour (enforced separately)
 */
import { logger } from '../config/logger';

interface EvaluationResult {
  clarity: number;
  context: number;
  accuracy: number;
  efficiency: number;
  total: number;
  feedback_de: string;
  feedback_en: string;
  ai_evaluated: boolean;
}

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

const SYSTEM_PROMPT = `Du bist ein KI-Prompt-Experte und bewertest Prompts für Microsoft 365 Copilot.
Bewerte den folgenden Prompt auf einer Skala von 0-25 in jeder Dimension:

KLARHEIT (0-25): Ist der Prompt eindeutig und unmissverständlich formuliert?
KONTEXT (0-25): Wurde ausreichend Kontext und Hintergrundinformation mitgegeben?
ZIELGENAUIGKEIT (0-25): Adressiert der Prompt exakt die gestellte Aufgabe?
EFFIZIENZ (0-25): Ist der Prompt präzise ohne unnötige Länge?

Antworte AUSSCHLIESSLICH im folgenden JSON-Format (kein Markdown, kein Text davor/danach):
{
  "clarity": <0-25>,
  "context": <0-25>,
  "accuracy": <0-25>,
  "efficiency": <0-25>,
  "total": <0-100>,
  "feedback_de": "<Konstruktives Feedback auf Deutsch, 2-3 Sätze>",
  "feedback_en": "<Constructive feedback in English, 2-3 sentences>"
}`;

const FALLBACK_RESPONSE: EvaluationResult = {
  clarity: 15,
  context: 15,
  accuracy: 15,
  efficiency: 15,
  total: 60,
  feedback_de: 'Die KI-Bewertung ist vorübergehend nicht verfügbar. Dein Prompt wurde mit einer Standard-Punktzahl bewertet.',
  feedback_en: 'AI evaluation is temporarily unavailable. Your prompt has been scored with a default score.',
  ai_evaluated: false,
};

export class MistralService {
  private static readonly baseUrl = 'https://api.mistral.ai/v1/chat/completions';
  private static readonly maxRetries = 2;

  static async evaluatePrompt(
    userPrompt: string,
    challengeDescription: string,
    idealPrompt: string
  ): Promise<EvaluationResult> {
    const apiKey = process.env.MISTRAL_API_KEY;
    const model = process.env.MISTRAL_MODEL ?? 'mistral-small-latest';

    if (!apiKey) {
      logger.warn('MISTRAL_API_KEY not set, using fallback evaluation');
      return FALLBACK_RESPONSE;
    }

    const userMessage = `Die Aufgabe war: ${challengeDescription}

Der ideale Prompt wäre: ${idealPrompt}

Der zu bewertende Prompt: ${userPrompt}`;

    const messages: MistralMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.1,
            max_tokens: 500,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Mistral API error ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as MistralResponse;
        const content = data.choices[0]?.message?.content;

        if (!content) throw new Error('Empty response from Mistral');

        // Parse JSON safely
        const parsed = JSON.parse(content) as Partial<EvaluationResult>;

        // Validate and clamp values
        const result: EvaluationResult = {
          clarity:    Math.min(25, Math.max(0, Math.round(parsed.clarity ?? 12))),
          context:    Math.min(25, Math.max(0, Math.round(parsed.context ?? 12))),
          accuracy:   Math.min(25, Math.max(0, Math.round(parsed.accuracy ?? 12))),
          efficiency: Math.min(25, Math.max(0, Math.round(parsed.efficiency ?? 12))),
          total:      0,
          feedback_de: parsed.feedback_de ?? FALLBACK_RESPONSE.feedback_de,
          feedback_en: parsed.feedback_en ?? FALLBACK_RESPONSE.feedback_en,
          ai_evaluated: true,
        };
        result.total = result.clarity + result.context + result.accuracy + result.efficiency;

        logger.info({ total: result.total }, 'Prompt evaluated by Mistral');
        return result;

      } catch (err) {
        logger.warn({ err, attempt }, 'Mistral API call failed');
        if (attempt === this.maxRetries) {
          logger.error('All Mistral retries exhausted, using fallback');
          return FALLBACK_RESPONSE;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return FALLBACK_RESPONSE;
  }
}
