/**
 * Badge checking and awarding service.
 * Criteria are stored in the `badges.criteria` JSONB field.
 */
import { query, queryOne } from '../config/database';
import { XpEvent } from '../types';
import { logger } from '../config/logger';

interface BadgeCriteria {
  type: 'quiz_correct' | 'level' | 'island_complete' | 'duel_win' | 'prompt_score' | 'streak';
  value: number;
  island_slug?: string;
}

interface BadgeRow {
  id: string;
  slug: string;
  name_de: string;
  name_en: string;
  criteria: BadgeCriteria;
}

interface UserStats {
  total_xp: number;
  current_level: number;
  quiz_correct: number;
  duels_won: number;
  islands_completed: number;
  max_prompt_score: number;
}

export class BadgeService {
  static async checkAndAward(userId: string, tenantId: string): Promise<XpEvent[]> {
    const events: XpEvent[] = [];

    // Get all badges the user doesn't have yet
    const badges = await query<BadgeRow>(`
      SELECT b.id, b.slug, b.name_de, b.name_en, b.criteria
      FROM badges b
      WHERE b.tenant_id = $1
        AND b.id NOT IN (
          SELECT badge_id FROM user_badges WHERE user_id = $2
        )
    `, [tenantId, userId]);

    if (badges.length === 0) return events;

    // Get user stats
    const stats = await queryOne<UserStats>(`
      SELECT
        u.total_xp,
        u.current_level,
        (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND is_correct = true)::int AS quiz_correct,
        (SELECT COUNT(*) FROM duels WHERE winner_id = $1)::int AS duels_won,
        (SELECT COUNT(*) FROM island_progress WHERE user_id = $1 AND status = 'completed')::int AS islands_completed,
        COALESCE((SELECT MAX(total_score) FROM prompt_attempts WHERE user_id = $1), 0)::int AS max_prompt_score
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (!stats) return events;

    for (const badge of badges) {
      const criteria = badge.criteria as BadgeCriteria;
      let earned = false;

      switch (criteria.type) {
        case 'level':
          earned = stats.current_level >= criteria.value;
          break;
        case 'quiz_correct':
          earned = stats.quiz_correct >= criteria.value;
          break;
        case 'duel_win':
          earned = stats.duels_won >= criteria.value;
          break;
        case 'island_complete':
          earned = stats.islands_completed >= criteria.value;
          break;
        case 'prompt_score':
          earned = stats.max_prompt_score >= criteria.value;
          break;
        default:
          break;
      }

      if (earned) {
        try {
          await query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, badge.id]
          );
          events.push({
            type: 'badge_earned',
            data: { badge_id: badge.id, badge_slug: badge.slug, name_de: badge.name_de, name_en: badge.name_en },
          });
          logger.info({ userId, badge: badge.slug }, 'Badge earned');
        } catch (err) {
          logger.warn({ err, badge: badge.slug }, 'Failed to award badge');
        }
      }
    }

    return events;
  }
}
