import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Island, IslandProgress } from '../types';

export async function getIslands(req: Request, res: Response): Promise<void> {
  const { tenantId, userId } = req.user!;

  const islands = await query<Island>(`
    SELECT i.*,
           ip.status,
           ip.completion_percentage,
           ip.guardian_defeated,
           ip.quiz_completed,
           ip.quiz_total,
           ip.prompt_completed,
           ip.prompt_total,
           ip.started_at,
           ip.completed_at
    FROM islands i
    LEFT JOIN island_progress ip ON ip.island_id = i.id AND ip.user_id = $2
    WHERE i.tenant_id = $1 AND i.is_active = true
    ORDER BY i.sort_order ASC
  `, [tenantId, userId]);

  // Determine lock status based on prerequisites
  const result = islands.map(island => {
    const prereqs = island.prerequisite_island_ids as unknown as string[];
    const isLocked = prereqs.length > 0 && prereqs.some(prereqId => {
      const prereqIsland = islands.find(i => i.id === prereqId);
      return prereqIsland && (prereqIsland as unknown as { status?: string }).status !== 'completed';
    });

    return {
      ...island,
      status: isLocked ? 'locked' : ((island as unknown as { status?: string }).status ?? 'available'),
    };
  });

  res.json({ success: true, data: result });
}

export async function getIsland(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<Island>(`
    SELECT i.*,
           ip.status,
           ip.completion_percentage,
           ip.guardian_defeated,
           ip.quiz_completed,
           ip.quiz_total,
           ip.prompt_completed,
           ip.prompt_total
    FROM islands i
    LEFT JOIN island_progress ip ON ip.island_id = i.id AND ip.user_id = $2
    WHERE i.tenant_id = $1 AND i.slug = $3 AND i.is_active = true
  `, [tenantId, userId, slug]);

  if (!island) throw new AppError(404, 'Island not found');

  // Get NPCs
  const npcs = await query(`
    SELECT name, role, dialogue_de, dialogue_en, sprite_url
    FROM npcs WHERE island_id = $1
  `, [island.id]);

  // Quiz stats
  const quizStats = await queryOne<{ total: number; answered: number; correct: number }>(`
    SELECT
      COUNT(DISTINCT qq.id)::int AS total,
      COUNT(DISTINCT qa.question_id)::int AS answered,
      COUNT(DISTINCT CASE WHEN qa.is_correct THEN qa.question_id END)::int AS correct
    FROM quiz_questions qq
    LEFT JOIN quiz_attempts qa ON qa.question_id = qq.id AND qa.user_id = $1
    WHERE qq.island_id = $2 AND qq.is_active = true
  `, [userId, island.id]);

  // Prompt stats
  const promptStats = await queryOne<{ total: number; attempted: number }>(`
    SELECT
      COUNT(DISTINCT pc.id)::int AS total,
      COUNT(DISTINCT pa.challenge_id)::int AS attempted
    FROM prompt_challenges pc
    LEFT JOIN prompt_attempts pa ON pa.challenge_id = pc.id AND pa.user_id = $1
    WHERE pc.island_id = $2 AND pc.is_active = true
  `, [userId, island.id]);

  // Auto-initialize progress if not exists
  if (!(island as unknown as { status?: string }).status) {
    await query(
      'INSERT INTO island_progress (user_id, island_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, island.id, 'available']
    );
  }

  res.json({
    success: true,
    data: {
      ...island,
      npcs,
      quiz_stats: quizStats,
      prompt_stats: promptStats,
    },
  });
}

export async function getIslandProgress(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const { tenantId, userId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2',
    [tenantId, slug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  const progress = await queryOne<IslandProgress>(
    'SELECT * FROM island_progress WHERE user_id = $1 AND island_id = $2',
    [userId, island.id]
  );

  // Recalculate progress
  const quizStats = await queryOne<{ total: number; correct: number }>(`
    SELECT
      COUNT(DISTINCT qq.id)::int AS total,
      COUNT(DISTINCT CASE WHEN qa.is_correct THEN qa.question_id END)::int AS correct
    FROM quiz_questions qq
    LEFT JOIN quiz_attempts qa ON qa.question_id = qq.id AND qa.user_id = $1
    WHERE qq.island_id = $2 AND qq.is_active = true
  `, [userId, island.id]);

  const promptStats = await queryOne<{ total: number; attempted: number }>(`
    SELECT
      COUNT(DISTINCT pc.id)::int AS total,
      COUNT(DISTINCT pa.challenge_id)::int AS attempted
    FROM prompt_challenges pc
    LEFT JOIN prompt_attempts pa ON pa.challenge_id = pc.id AND pa.user_id = $1
    WHERE pc.island_id = $2 AND pc.is_active = true
  `, [userId, island.id]);

  const totalTasks = (quizStats?.total ?? 0) + (promptStats?.total ?? 0);
  const completedTasks = (quizStats?.correct ?? 0) + (promptStats?.attempted ?? 0);
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update progress
  if (progress) {
    await query(`
      UPDATE island_progress
      SET completion_percentage = $1, quiz_completed = $2, quiz_total = $3,
          prompt_completed = $4, prompt_total = $5,
          status = CASE WHEN $1 >= 100 AND guardian_defeated THEN 'completed'
                        WHEN $1 > 0 THEN 'in_progress'
                        ELSE status END,
          updated_at = NOW()
      WHERE user_id = $6 AND island_id = $7
    `, [percentage, quizStats?.correct ?? 0, quizStats?.total ?? 0,
        promptStats?.attempted ?? 0, promptStats?.total ?? 0,
        userId, island.id]);
  }

  res.json({
    success: true,
    data: {
      island_id: island.id,
      completion_percentage: percentage,
      quiz_stats: quizStats,
      prompt_stats: promptStats,
      guardian_defeated: progress?.guardian_defeated ?? false,
    },
  });
}
