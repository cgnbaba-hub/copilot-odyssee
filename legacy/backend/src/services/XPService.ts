/**
 * XP & Level Engine for CoPilot Odyssey
 * Level curve: exponential growth up to 50, linear 50-100, constant beyond
 */
import { queryTransaction } from '../config/database';
import { BadgeService } from './BadgeService';
import { XpResult, XpEvent } from '../types';
import { logger } from '../config/logger';

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 50) return Math.floor(100 * ((Math.pow(1.15, level - 1) - 1) / 0.15));
  if (level <= 100) return xpRequiredForLevel(50) + (level - 50) * 3000;
  return xpRequiredForLevel(100) + (level - 100) * 5000;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= totalXp) {
    level++;
    if (level > 200) break; // safety cap
  }
  return level;
}

export function xpToNextLevel(totalXp: number): { current: number; required: number; level: number } {
  const level = levelFromXp(totalXp);
  const current = totalXp - xpRequiredForLevel(level);
  const required = xpRequiredForLevel(level + 1) - xpRequiredForLevel(level);
  return { current, required, level };
}

export class XPService {
  /**
   * Award XP to a user, handle level-ups, badge checks, guild updates.
   */
  static async awardXP(userId: string, xpAmount: number, tenantId: string): Promise<XpResult> {
    const events: XpEvent[] = [];

    const result = await queryTransaction(async (client) => {
      // Lock user row
      const userRow = await client.query(
        'SELECT total_xp, current_level FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      if (userRow.rows.length === 0) throw new Error('User not found');

      const oldXp: number = parseInt(userRow.rows[0].total_xp as string, 10);
      const oldLevel: number = userRow.rows[0].current_level as number;
      const newXp = oldXp + xpAmount;
      const newLevel = levelFromXp(newXp);

      // Update user
      await client.query(
        'UPDATE users SET total_xp = $1, current_level = $2, updated_at = NOW() WHERE id = $3',
        [newXp, newLevel, userId]
      );

      // Update leaderboard (alltime)
      await client.query(`
        INSERT INTO leaderboard_entries (tenant_id, user_id, period_type, period_start, xp_earned)
        VALUES ($1, $2, 'alltime', '2000-01-01', $3)
        ON CONFLICT (tenant_id, user_id, period_type, period_start)
        DO UPDATE SET xp_earned = leaderboard_entries.xp_earned + $3
      `, [tenantId, userId, xpAmount]);

      // Update leaderboard (weekly)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      await client.query(`
        INSERT INTO leaderboard_entries (tenant_id, user_id, period_type, period_start, xp_earned)
        VALUES ($1, $2, 'weekly', $3, $4)
        ON CONFLICT (tenant_id, user_id, period_type, period_start)
        DO UPDATE SET xp_earned = leaderboard_entries.xp_earned + $4
      `, [tenantId, userId, weekStartStr, xpAmount]);

      // Update guild XP if member
      await client.query(`
        UPDATE guilds g
        SET total_xp = g.total_xp + $1
        FROM guild_members gm
        WHERE gm.guild_id = g.id AND gm.user_id = $2
      `, [xpAmount, userId]);

      return { oldXp, oldLevel, newXp, newLevel };
    });

    const leveledUp = result.newLevel > result.oldLevel;
    if (leveledUp) {
      for (let lvl = result.oldLevel + 1; lvl <= result.newLevel; lvl++) {
        events.push({ type: 'level_up', data: { level: lvl } });
        logger.info({ userId, level: lvl }, 'Level up!');
      }
    }

    // Check badges
    try {
      const badgeEvents = await BadgeService.checkAndAward(userId, tenantId);
      events.push(...badgeEvents);
    } catch (err) {
      logger.warn({ err }, 'Badge check failed (non-fatal)');
    }

    return {
      xpEarned: xpAmount,
      newTotalXp: result.newXp,
      newLevel: result.newLevel,
      oldLevel: result.oldLevel,
      leveledUp,
      events,
    };
  }
}
