import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';

export async function getDailyQuest(req: Request, res: Response): Promise<void> {
  const { tenantId, userId } = req.user!;
  const today = new Date().toISOString().split('T')[0];

  const quest = await queryOne(`
    SELECT dq.id, dq.quest_date,
           pc.title_de, pc.title_en, pc.description_de, pc.description_en,
           pc.difficulty, pc.xp_reward_max,
           EXISTS(
             SELECT 1 FROM user_quest_completions uqc
             WHERE uqc.user_id = $1 AND uqc.quest_id = dq.id AND uqc.quest_type = 'daily'
           ) AS completed
    FROM daily_quests dq
    JOIN prompt_challenges pc ON pc.id = dq.challenge_id
    WHERE dq.tenant_id = $2 AND dq.quest_date = $3 AND dq.is_active = true
  `, [userId, tenantId, today]);

  res.json({ success: true, data: quest });
}

export async function getWeeklyQuest(req: Request, res: Response): Promise<void> {
  const { tenantId, userId } = req.user!;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const quest = await queryOne(`
    SELECT wq.*,
           EXISTS(
             SELECT 1 FROM user_quest_completions uqc
             WHERE uqc.user_id = $1 AND uqc.quest_id = wq.id AND uqc.quest_type = 'weekly'
           ) AS completed
    FROM weekly_quests wq
    WHERE wq.tenant_id = $2 AND wq.week_start = $3
  `, [userId, tenantId, weekStartStr]);

  // Get leaderboard for this week
  const leaderboard = await query(`
    SELECT u.display_name, u.current_level, uqc.xp_earned, uqc.completed_at
    FROM user_quest_completions uqc
    JOIN users u ON u.id = uqc.user_id
    WHERE uqc.quest_type = 'weekly'
      AND uqc.quest_id = $1
    ORDER BY uqc.xp_earned DESC, uqc.completed_at ASC
    LIMIT 10
  `, [quest ? (quest as unknown as { id: string }).id : '00000000-0000-0000-0000-000000000000']);

  res.json({ success: true, data: { quest, leaderboard } });
}
