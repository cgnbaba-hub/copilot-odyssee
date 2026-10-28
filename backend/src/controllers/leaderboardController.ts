import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { PeriodType } from '../types';

function getPeriodStart(period: PeriodType): string {
  const now = new Date();
  switch (period) {
    case 'daily': {
      return now.toISOString().split('T')[0]!;
    }
    case 'weekly': {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().split('T')[0]!;
    }
    case 'monthly': {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
    case 'alltime':
      return '2000-01-01';
  }
}

export async function getGlobalLeaderboard(req: Request, res: Response): Promise<void> {
  const { tenantId, userId } = req.user!;
  const period = (req.query.period as PeriodType) ?? 'alltime';
  const periodStart = getPeriodStart(period);

  const top50 = await query(`
    SELECT
      le.user_id,
      u.display_name,
      u.current_level,
      u.avatar_config,
      le.xp_earned,
      le.duels_won,
      RANK() OVER (ORDER BY le.xp_earned DESC) AS rank
    FROM leaderboard_entries le
    JOIN users u ON u.id = le.user_id
    WHERE le.tenant_id = $1
      AND le.period_type = $2
      AND le.period_start = $3
    ORDER BY le.xp_earned DESC
    LIMIT 50
  `, [tenantId, period, periodStart]);

  // Find own rank if not in top 50
  const ownEntry = await queryOne(`
    SELECT xp_earned,
           (SELECT COUNT(*) + 1 FROM leaderboard_entries le2
            WHERE le2.tenant_id = $1 AND le2.period_type = $2 AND le2.period_start = $3
              AND le2.xp_earned > le.xp_earned)::int AS rank
    FROM leaderboard_entries le
    WHERE tenant_id = $1 AND period_type = $2 AND period_start = $3 AND user_id = $4
  `, [tenantId, period, periodStart, userId]);

  res.json({ success: true, data: { entries: top50, own_rank: ownEntry } });
}

export async function getIslandLeaderboard(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const { tenantId } = req.user!;

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2',
    [tenantId, slug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  const entries = await query(`
    SELECT
      u.id AS user_id,
      u.display_name,
      u.current_level,
      u.avatar_config,
      COALESCE(SUM(qa.xp_earned), 0) + COALESCE(SUM(pa.xp_earned), 0) AS xp_earned,
      COUNT(DISTINCT CASE WHEN qa.is_correct THEN qa.id END)::int AS correct_answers,
      RANK() OVER (ORDER BY (COALESCE(SUM(qa.xp_earned), 0) + COALESCE(SUM(pa.xp_earned), 0)) DESC) AS rank
    FROM users u
    LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
      AND qa.question_id IN (SELECT id FROM quiz_questions WHERE island_id = $1)
    LEFT JOIN prompt_attempts pa ON pa.user_id = u.id
      AND pa.challenge_id IN (SELECT id FROM prompt_challenges WHERE island_id = $1)
    WHERE u.tenant_id = $2
    GROUP BY u.id, u.display_name, u.current_level, u.avatar_config
    HAVING COALESCE(SUM(qa.xp_earned), 0) + COALESCE(SUM(pa.xp_earned), 0) > 0
    ORDER BY xp_earned DESC
    LIMIT 50
  `, [island.id, tenantId]);

  res.json({ success: true, data: entries });
}

export async function getGuildLeaderboard(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const guilds = await query(`
    SELECT
      g.id, g.name, g.emblem_config, g.level, g.total_xp,
      COUNT(gm.user_id)::int AS member_count,
      RANK() OVER (ORDER BY g.total_xp DESC) AS rank
    FROM guilds g
    LEFT JOIN guild_members gm ON gm.guild_id = g.id
    WHERE g.tenant_id = $1
    GROUP BY g.id, g.name, g.emblem_config, g.level, g.total_xp
    ORDER BY g.total_xp DESC
    LIMIT 50
  `, [tenantId]);

  res.json({ success: true, data: guilds });
}

export async function getDuelLeaderboard(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;

  const entries = await query(`
    SELECT
      u.id AS user_id,
      u.display_name,
      u.current_level,
      u.avatar_config,
      COUNT(d.id)::int AS total_duels,
      COUNT(CASE WHEN d.winner_id = u.id THEN 1 END)::int AS wins,
      RANK() OVER (ORDER BY COUNT(CASE WHEN d.winner_id = u.id THEN 1 END) DESC) AS rank
    FROM users u
    LEFT JOIN duels d ON (d.player_a_id = u.id OR d.player_b_id = u.id) AND d.status = 'completed'
    WHERE u.tenant_id = $1
    GROUP BY u.id, u.display_name, u.current_level, u.avatar_config
    HAVING COUNT(d.id) > 0
    ORDER BY wins DESC
    LIMIT 50
  `, [tenantId]);

  res.json({ success: true, data: entries });
}
