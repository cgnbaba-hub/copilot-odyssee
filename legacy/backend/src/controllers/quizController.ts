import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { XPService } from '../services/XPService';
import { AppError } from '../middleware/errorHandler';
import type { QuizQuestion, QuizOption } from '../types';

export async function getNextQuestion(req: Request, res: Response): Promise<void> {
  const { islandSlug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2 AND is_active = true',
    [tenantId, islandSlug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  // Get next unanswered question (ordered by difficulty then random)
  const question = await queryOne<QuizQuestion>(`
    SELECT qq.*
    FROM quiz_questions qq
    WHERE qq.island_id = $1
      AND qq.is_active = true
      AND qq.id NOT IN (
        SELECT DISTINCT question_id FROM quiz_attempts WHERE user_id = $2
      )
    ORDER BY
      CASE qq.difficulty
        WHEN 'beginner'     THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced'     THEN 3
        WHEN 'expert'       THEN 4
      END,
      RANDOM()
    LIMIT 1
  `, [island.id, userId]);

  if (!question) {
    res.json({ success: true, data: null, message: 'All questions completed for this island' });
    return;
  }

  // Get options (without revealing which is correct)
  const options = await query<QuizOption>(`
    SELECT id, text_de, text_en, sort_order
    FROM quiz_options
    WHERE question_id = $1
    ORDER BY sort_order, RANDOM()
  `, [question.id]);

  // Stats: how many done
  const stats = await queryOne<{ answered: number; total: number }>(`
    SELECT
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND question_id IN (
        SELECT id FROM quiz_questions WHERE island_id = $2
      ))::int AS answered,
      (SELECT COUNT(*) FROM quiz_questions WHERE island_id = $2 AND is_active = true)::int AS total
  `, [userId, island.id]);

  res.json({
    success: true,
    data: {
      question: {
        id: question.id,
        question_de: question.question_de,
        question_en: question.question_en,
        difficulty: question.difficulty,
        xp_reward: question.xp_reward,
        options,
      },
      progress: stats,
    },
  });
}

export async function submitAnswer(req: Request, res: Response): Promise<void> {
  const { question_id, option_id } = req.body as { question_id: string; option_id: string };
  const { tenantId, userId } = req.user!;

  // Check not already answered
  const existing = await queryOne(
    'SELECT id FROM quiz_attempts WHERE user_id = $1 AND question_id = $2',
    [userId, question_id]
  );
  if (existing) throw new AppError(409, 'Question already answered');

  // Get question
  const question = await queryOne<QuizQuestion>(
    'SELECT * FROM quiz_questions WHERE id = $1',
    [question_id]
  );
  if (!question) throw new AppError(404, 'Question not found');

  // Get all options with correct answer revealed
  const options = await query<QuizOption>(
    'SELECT * FROM quiz_options WHERE question_id = $1 ORDER BY sort_order',
    [question_id]
  );

  const selectedOption = options.find(o => o.id === option_id);
  if (!selectedOption) throw new AppError(400, 'Invalid option');

  const isCorrect = selectedOption.is_correct;
  const xpEarned = isCorrect ? question.xp_reward : 0;

  // Save attempt
  await query(
    'INSERT INTO quiz_attempts (user_id, question_id, selected_option_id, is_correct, xp_earned) VALUES ($1, $2, $3, $4, $5)',
    [userId, question_id, option_id, isCorrect, xpEarned]
  );

  // Award XP
  let xpResult = null;
  if (xpEarned > 0) {
    xpResult = await XPService.awardXP(userId, xpEarned, tenantId);
  }

  // Find correct option
  const correctOption = options.find(o => o.is_correct);

  res.json({
    success: true,
    data: {
      is_correct: isCorrect,
      xp_earned: xpEarned,
      xp_result: xpResult,
      correct_option_id: correctOption?.id,
      explanation_de: selectedOption.explanation_de,
      explanation_en: selectedOption.explanation_en,
      options_with_correct: options.map(o => ({
        id: o.id,
        text_de: o.text_de,
        text_en: o.text_en,
        is_correct: o.is_correct,
        explanation_de: o.explanation_de,
        explanation_en: o.explanation_en,
      })),
    },
  });
}

export async function getQuizStats(req: Request, res: Response): Promise<void> {
  const { islandSlug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2',
    [tenantId, islandSlug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  const stats = await queryOne(`
    SELECT
      COUNT(DISTINCT qq.id)::int AS total_questions,
      COUNT(DISTINCT qa.question_id)::int AS answered,
      COUNT(DISTINCT CASE WHEN qa.is_correct THEN qa.question_id END)::int AS correct,
      COALESCE(SUM(qa.xp_earned), 0)::int AS total_xp_earned,
      COUNT(DISTINCT CASE WHEN qq.difficulty = 'beginner'     THEN qq.id END)::int AS beginner_total,
      COUNT(DISTINCT CASE WHEN qq.difficulty = 'intermediate' THEN qq.id END)::int AS intermediate_total,
      COUNT(DISTINCT CASE WHEN qq.difficulty = 'advanced'     THEN qq.id END)::int AS advanced_total,
      COUNT(DISTINCT CASE WHEN qq.difficulty = 'expert'       THEN qq.id END)::int AS expert_total
    FROM quiz_questions qq
    LEFT JOIN quiz_attempts qa ON qa.question_id = qq.id AND qa.user_id = $1
    WHERE qq.island_id = $2 AND qq.is_active = true
  `, [userId, island.id]);

  res.json({ success: true, data: stats });
}
