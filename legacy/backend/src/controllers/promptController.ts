import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { XPService } from '../services/XPService';
import { MistralService } from '../services/MistralService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { PromptChallenge } from '../types';

const MAX_PROMPT_EVALUATIONS_PER_HOUR = 10;

async function checkRateLimit(userId: string): Promise<void> {
  const count = await queryOne<{ count: number }>(`
    SELECT COUNT(*)::int AS count
    FROM prompt_attempts
    WHERE user_id = $1 AND ai_evaluated = true AND attempted_at > NOW() - INTERVAL '1 hour'
  `, [userId]);

  if ((count?.count ?? 0) >= MAX_PROMPT_EVALUATIONS_PER_HOUR) {
    throw new AppError(429, `Rate limit: max ${MAX_PROMPT_EVALUATIONS_PER_HOUR} AI evaluations per hour`);
  }
}

export async function getNextChallenge(req: Request, res: Response): Promise<void> {
  const { islandSlug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2 AND is_active = true',
    [tenantId, islandSlug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  // Get next unattempted challenge
  const challenge = await queryOne<PromptChallenge>(`
    SELECT *
    FROM prompt_challenges
    WHERE island_id = $1
      AND is_active = true
      AND id NOT IN (
        SELECT DISTINCT challenge_id FROM prompt_attempts WHERE user_id = $2
      )
    ORDER BY
      CASE difficulty
        WHEN 'beginner'     THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced'     THEN 3
        WHEN 'expert'       THEN 4
      END
    LIMIT 1
  `, [island.id, userId]);

  if (!challenge) {
    res.json({ success: true, data: null, message: 'All challenges completed for this island' });
    return;
  }

  const stats = await queryOne<{ attempted: number; total: number }>(`
    SELECT
      (SELECT COUNT(*) FROM prompt_attempts WHERE user_id = $1 AND challenge_id IN (
        SELECT id FROM prompt_challenges WHERE island_id = $2
      ))::int AS attempted,
      (SELECT COUNT(*) FROM prompt_challenges WHERE island_id = $2 AND is_active = true)::int AS total
  `, [userId, island.id]);

  // Don't expose ideal prompt yet
  const { ideal_prompt_de, ideal_prompt_en, ...challengePublic } = challenge;
  void ideal_prompt_de;
  void ideal_prompt_en;

  res.json({ success: true, data: { challenge: challengePublic, progress: stats } });
}

export async function submitPrompt(req: Request, res: Response): Promise<void> {
  const { challenge_id, prompt_text } = req.body as { challenge_id: string; prompt_text: string };
  const { tenantId, userId } = req.user!;

  // Rate limit check
  await checkRateLimit(userId);

  const challenge = await queryOne<PromptChallenge>(
    'SELECT * FROM prompt_challenges WHERE id = $1 AND is_active = true',
    [challenge_id]
  );
  if (!challenge) throw new AppError(404, 'Challenge not found');

  // Check tenant access
  if (challenge.tenant_id !== tenantId) throw new AppError(403, 'Access denied');

  // Get user language for feedback
  const user = await queryOne<{ preferred_language: string }>(
    'SELECT preferred_language FROM users WHERE id = $1',
    [userId]
  );
  const lang = user?.preferred_language ?? 'de';

  logger.info({ userId, challenge_id }, 'Evaluating prompt');

  // Evaluate with Mistral
  const evaluation = await MistralService.evaluatePrompt(
    prompt_text,
    lang === 'de' ? challenge.description_de : challenge.description_en,
    lang === 'de' ? challenge.ideal_prompt_de : challenge.ideal_prompt_en
  );

  // Calculate XP (proportional to score)
  const xpEarned = Math.round((evaluation.total / 100) * challenge.xp_reward_max);

  // Save attempt
  const [attempt] = await query(`
    INSERT INTO prompt_attempts (
      user_id, challenge_id, prompt_text,
      score_clarity, score_context, score_accuracy, score_efficiency, total_score,
      ai_feedback_de, ai_feedback_en, xp_earned, ai_evaluated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    userId, challenge_id, prompt_text,
    evaluation.clarity, evaluation.context, evaluation.accuracy, evaluation.efficiency,
    evaluation.total, evaluation.feedback_de, evaluation.feedback_en,
    xpEarned, evaluation.ai_evaluated,
  ]);

  // Award XP
  let xpResult = null;
  if (xpEarned > 0) {
    xpResult = await XPService.awardXP(userId, xpEarned, tenantId);
  }

  res.json({
    success: true,
    data: {
      attempt,
      evaluation,
      xp_earned: xpEarned,
      xp_result: xpResult,
      ideal_prompt: {
        de: challenge.ideal_prompt_de,
        en: challenge.ideal_prompt_en,
      },
    },
  });
}

export async function getPromptHistory(req: Request, res: Response): Promise<void> {
  const { islandSlug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2',
    [tenantId, islandSlug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  const history = await query(`
    SELECT pa.*, pc.title_de, pc.title_en, pc.difficulty
    FROM prompt_attempts pa
    JOIN prompt_challenges pc ON pc.id = pa.challenge_id
    WHERE pa.user_id = $1 AND pc.island_id = $2
    ORDER BY pa.attempted_at DESC
    LIMIT 50
  `, [userId, island.id]);

  res.json({ success: true, data: history });
}
