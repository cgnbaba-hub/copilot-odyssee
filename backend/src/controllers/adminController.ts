/**
 * Admin Controller – Content management & Analytics
 * All routes require role: content_admin or super_admin
 */
import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';

// ============================================================
// QUIZ
// ============================================================
export async function listQuestions(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;
  const { island_slug, difficulty, page = '1', limit = '20' } = req.query as Record<string, string>;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const rows = await query(`
    SELECT qq.*, i.slug AS island_slug, i.name_de AS island_name
    FROM quiz_questions qq
    JOIN islands i ON i.id = qq.island_id
    WHERE qq.tenant_id = $1
      AND ($2::text IS NULL OR i.slug = $2)
      AND ($3::text IS NULL OR qq.difficulty::text = $3)
    ORDER BY i.sort_order, qq.difficulty, qq.created_at
    LIMIT $4 OFFSET $5
  `, [tenantId, island_slug ?? null, difficulty ?? null, limit, offset]);

  const total = await queryOne<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM quiz_questions WHERE tenant_id = $1',
    [tenantId]
  );

  res.json({ success: true, data: rows, total: total?.count ?? 0 });
}

export async function createQuestion(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;
  const { island_slug, question_de, question_en, difficulty, xp_reward, options } = req.body as {
    island_slug: string;
    question_de: string;
    question_en: string;
    difficulty: string;
    xp_reward: number;
    options: Array<{ text_de: string; text_en: string; is_correct: boolean; explanation_de: string; explanation_en: string }>;
  };

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2',
    [tenantId, island_slug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  const [question] = await query(`
    INSERT INTO quiz_questions (tenant_id, island_id, question_de, question_en, difficulty, xp_reward)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [tenantId, island.id, question_de, question_en, difficulty, xp_reward]);

  const q = question as unknown as { id: string };

  for (let i = 0; i < options.length; i++) {
    const opt = options[i]!;
    await query(`
      INSERT INTO quiz_options (question_id, text_de, text_en, is_correct, explanation_de, explanation_en, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [q.id, opt.text_de, opt.text_en, opt.is_correct, opt.explanation_de, opt.explanation_en, i]);
  }

  res.status(201).json({ success: true, data: question });
}

export async function updateQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tenantId } = req.user!;
  const { question_de, question_en, difficulty, xp_reward, is_active } = req.body as {
    question_de?: string;
    question_en?: string;
    difficulty?: string;
    xp_reward?: number;
    is_active?: boolean;
  };

  const existing = await queryOne('SELECT id FROM quiz_questions WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
  if (!existing) throw new AppError(404, 'Question not found');

  await query(`
    UPDATE quiz_questions
    SET question_de = COALESCE($2, question_de),
        question_en = COALESCE($3, question_en),
        difficulty  = COALESCE($4::difficulty_level, difficulty),
        xp_reward   = COALESCE($5, xp_reward),
        is_active   = COALESCE($6, is_active),
        updated_at  = NOW()
    WHERE id = $1
  `, [id, question_de ?? null, question_en ?? null, difficulty ?? null, xp_reward ?? null, is_active ?? null]);

  res.json({ success: true, message: 'Updated' });
}

export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tenantId } = req.user!;

  const existing = await queryOne(
    'SELECT id FROM quiz_questions WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  if (!existing) throw new AppError(404, 'Question not found');

  await query('DELETE FROM quiz_questions WHERE id = $1', [id]);
  res.json({ success: true, message: 'Deleted' });
}

// ============================================================
// ANALYTICS
// ============================================================
export async function getActiveUsers(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;
  const days = parseInt(req.query.days as string ?? '30', 10);

  const rows = await query(`
    SELECT
      DATE_TRUNC('day', attempted_at)::date AS date,
      COUNT(DISTINCT user_id)::int AS active_users
    FROM (
      SELECT user_id, attempted_at FROM quiz_attempts
      UNION ALL
      SELECT user_id, attempted_at FROM prompt_attempts
    ) activity
    JOIN users u ON u.id = activity.user_id
    WHERE u.tenant_id = $1 AND attempted_at >= NOW() - INTERVAL '${days} days'
    GROUP BY 1
    ORDER BY 1
  `, [tenantId]);

  res.json({ success: true, data: rows });
}

export async function getLevelDistribution(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const rows = await query(`
    SELECT
      CASE
        WHEN current_level <= 10  THEN '1-10'
        WHEN current_level <= 20  THEN '11-20'
        WHEN current_level <= 30  THEN '21-30'
        WHEN current_level <= 50  THEN '31-50'
        ELSE '50+'
      END AS level_range,
      COUNT(*)::int AS player_count
    FROM users
    WHERE tenant_id = $1
    GROUP BY 1
    ORDER BY MIN(current_level)
  `, [tenantId]);

  res.json({ success: true, data: rows });
}

export async function getIslandCompletion(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const rows = await query(`
    SELECT
      i.name_de, i.name_en, i.slug,
      COUNT(ip.user_id)::int AS started,
      COUNT(CASE WHEN ip.status = 'completed' THEN 1 END)::int AS completed,
      ROUND(AVG(ip.completion_percentage), 1) AS avg_completion
    FROM islands i
    LEFT JOIN island_progress ip ON ip.island_id = i.id
    WHERE i.tenant_id = $1
    GROUP BY i.id, i.name_de, i.name_en, i.slug
    ORDER BY i.sort_order
  `, [tenantId]);

  res.json({ success: true, data: rows });
}

export async function getPromptQualityTrend(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const rows = await query(`
    SELECT
      DATE_TRUNC('day', pa.attempted_at)::date AS date,
      ROUND(AVG(pa.total_score), 1) AS avg_score,
      COUNT(*)::int AS attempts
    FROM prompt_attempts pa
    JOIN users u ON u.id = pa.user_id
    WHERE u.tenant_id = $1 AND pa.attempted_at >= NOW() - INTERVAL '30 days'
    GROUP BY 1
    ORDER BY 1
  `, [tenantId]);

  res.json({ success: true, data: rows });
}

export async function getHardestQuestions(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const rows = await query(`
    SELECT
      qq.question_de, qq.question_en, qq.difficulty,
      i.name_de AS island_name,
      COUNT(qa.id)::int AS total_attempts,
      COUNT(CASE WHEN qa.is_correct THEN 1 END)::int AS correct_attempts,
      ROUND(100.0 * COUNT(CASE WHEN qa.is_correct THEN 1 END) / NULLIF(COUNT(qa.id), 0), 1) AS accuracy_pct
    FROM quiz_questions qq
    JOIN quiz_attempts qa ON qa.question_id = qq.id
    JOIN islands i ON i.id = qq.island_id
    WHERE qq.tenant_id = $1
    GROUP BY qq.id, qq.question_de, qq.question_en, qq.difficulty, i.name_de
    HAVING COUNT(qa.id) >= 5
    ORDER BY accuracy_pct ASC
    LIMIT 20
  `, [tenantId]);

  res.json({ success: true, data: rows });
}

export async function getDuelStatistics(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const stats = await queryOne(`
    SELECT
      COUNT(*)::int AS total_duels,
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_duels,
      COUNT(CASE WHEN status = 'expired' THEN 1 END)::int AS expired_duels,
      ROUND(AVG(CASE WHEN status = 'completed' THEN player_a_score END), 1) AS avg_player_a_score,
      ROUND(AVG(CASE WHEN status = 'completed' THEN player_b_score END), 1) AS avg_player_b_score
    FROM duels WHERE tenant_id = $1
  `, [tenantId]);

  res.json({ success: true, data: stats });
}

export async function exportCSV(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const [activeUsers, islandCompletion, promptTrend] = await Promise.all([
    query(`
      SELECT DATE_TRUNC('day', attempted_at)::date AS date, COUNT(DISTINCT user_id) AS active_users
      FROM (SELECT user_id, attempted_at FROM quiz_attempts UNION ALL SELECT user_id, attempted_at FROM prompt_attempts) a
      JOIN users u ON u.id = a.user_id WHERE u.tenant_id = $1 GROUP BY 1 ORDER BY 1
    `, [tenantId]),
    query(`
      SELECT i.slug, COUNT(ip.user_id) AS started, COUNT(CASE WHEN ip.status='completed' THEN 1 END) AS completed
      FROM islands i LEFT JOIN island_progress ip ON ip.island_id=i.id WHERE i.tenant_id=$1 GROUP BY i.id,i.slug
    `, [tenantId]),
    query(`
      SELECT DATE_TRUNC('day', pa.attempted_at)::date AS date, ROUND(AVG(pa.total_score),1) AS avg_score
      FROM prompt_attempts pa JOIN users u ON u.id=pa.user_id WHERE u.tenant_id=$1 GROUP BY 1 ORDER BY 1
    `, [tenantId]),
  ]);

  const rows = [
    '--- Active Users ---',
    'date,active_users',
    ...activeUsers.map((r: unknown) => {
      const row = r as { date: string; active_users: number };
      return `${row.date},${row.active_users}`;
    }),
    '',
    '--- Island Completion ---',
    'island_slug,started,completed',
    ...islandCompletion.map((r: unknown) => {
      const row = r as { slug: string; started: number; completed: number };
      return `${row.slug},${row.started},${row.completed}`;
    }),
    '',
    '--- Prompt Quality Trend ---',
    'date,avg_score',
    ...promptTrend.map((r: unknown) => {
      const row = r as { date: string; avg_score: number };
      return `${row.date},${row.avg_score}`;
    }),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="odyssey-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(rows);
}
