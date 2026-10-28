import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { xpToNextLevel } from '../services/XPService';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const user = await queryOne(`
    SELECT u.id, u.username, u.display_name, u.current_level, u.total_xp,
           u.preferred_language, u.role, u.avatar_config, u.created_at,
           g.id AS guild_id, g.name AS guild_name, gm.role AS guild_role
    FROM users u
    LEFT JOIN guild_members gm ON gm.user_id = u.id
    LEFT JOIN guilds g ON g.id = gm.guild_id
    WHERE u.id = $1
  `, [userId]);

  if (!user) throw new AppError(404, 'User not found');

  const u = user as unknown as { total_xp: number; current_level: number };
  const xpProgress = xpToNextLevel(u.total_xp);

  const badges = await query(`
    SELECT b.slug, b.name_de, b.name_en, b.description_de, b.description_en,
           b.icon_url, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = $1
    ORDER BY ub.earned_at DESC
  `, [userId]);

  const classes = await query(`
    SELECT cc.slug, cc.name_de, cc.name_en, cc.description_de, cc.description_en,
           cc.icon_url, uc.status, uc.unlocked_at
    FROM user_classes uc
    JOIN character_classes cc ON cc.id = uc.class_id
    WHERE uc.user_id = $1
  `, [userId]);

  res.json({
    success: true,
    data: {
      ...user,
      xp_progress: xpProgress,
      badges,
      classes,
    },
  });
}

export async function updateAvatar(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const { avatar_config } = req.body as { avatar_config: Record<string, unknown> };

  await query(
    'UPDATE users SET avatar_config = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(avatar_config), userId]
  );

  res.json({ success: true, message: 'Avatar updated' });
}

export async function getUserProgress(req: Request, res: Response): Promise<void> {
  const { userId, tenantId } = req.user!;

  const islands = await query(`
    SELECT i.slug, i.name_de, i.name_en, i.color_primary,
           ip.status, ip.completion_percentage, ip.guardian_defeated,
           ip.quiz_completed, ip.quiz_total, ip.prompt_completed, ip.prompt_total
    FROM islands i
    LEFT JOIN island_progress ip ON ip.island_id = i.id AND ip.user_id = $2
    WHERE i.tenant_id = $1 AND i.is_active = true
    ORDER BY i.sort_order
  `, [tenantId, userId]);

  res.json({ success: true, data: { islands } });
}

export async function getUserStats(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const stats = await queryOne(`
    SELECT
      u.current_level,
      u.total_xp,
      (SELECT COUNT(*) FROM island_progress WHERE user_id = $1 AND status = 'completed')::int AS islands_completed,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1)::int AS quiz_total,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND is_correct = true)::int AS quiz_correct,
      (SELECT COUNT(*) FROM prompt_attempts WHERE user_id = $1)::int AS prompt_total,
      COALESCE((SELECT AVG(total_score) FROM prompt_attempts WHERE user_id = $1), 0)::numeric(5,1) AS prompt_avg_score,
      (SELECT COUNT(*) FROM duels WHERE (player_a_id = $1 OR player_b_id = $1) AND status = 'completed')::int AS duels_total,
      (SELECT COUNT(*) FROM duels WHERE winner_id = $1)::int AS duels_won,
      (SELECT COUNT(*) FROM user_badges WHERE user_id = $1)::int AS badges_earned
    FROM users u
    WHERE u.id = $1
  `, [userId]);

  if (!stats) throw new AppError(404, 'User not found');

  const s = stats as unknown as { quiz_total: number; quiz_correct: number };
  const quizAccuracy = s.quiz_total > 0
    ? Math.round((s.quiz_correct / s.quiz_total) * 100)
    : 0;

  res.json({
    success: true,
    data: { ...stats, quiz_accuracy_percent: quizAccuracy },
  });
}
