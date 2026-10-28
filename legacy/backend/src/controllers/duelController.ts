import { Request, Response } from 'express';
import { query, queryOne, queryTransaction } from '../config/database';
import { XPService } from '../services/XPService';
import { MistralService } from '../services/MistralService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { DifficultyLevel } from '../types';

const DUEL_LEVEL_RANGE = 5;

export async function createDuel(req: Request, res: Response): Promise<void> {
  const { island_slug, difficulty = 'intermediate' } = req.body as {
    island_slug: string;
    difficulty?: DifficultyLevel;
  };
  const { tenantId, userId } = req.user!;

  const user = await queryOne<{ current_level: number }>(
    'SELECT current_level FROM users WHERE id = $1',
    [userId]
  );
  if (!user) throw new AppError(404, 'User not found');

  const island = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND slug = $2 AND is_active = true',
    [tenantId, island_slug]
  );
  if (!island) throw new AppError(404, 'Island not found');

  // Get random challenge
  const challenge = await queryOne<{ id: string }>(
    'SELECT id FROM prompt_challenges WHERE island_id = $1 AND difficulty = $2 AND is_active = true ORDER BY RANDOM() LIMIT 1',
    [island.id, difficulty]
  );
  if (!challenge) throw new AppError(404, 'No challenge available for this difficulty');

  const result = await queryTransaction(async (client) => {
    // Look for opponent in queue
    const opponent = await client.query(`
      SELECT dq.user_id, dq.id AS queue_id
      FROM duel_queue dq
      JOIN users u ON u.id = dq.user_id
      WHERE dq.island_id = $1
        AND dq.difficulty = $2
        AND dq.user_id != $3
        AND ABS(u.current_level - $4) <= $5
      ORDER BY dq.created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `, [island.id, difficulty, userId, user.current_level, DUEL_LEVEL_RANGE]);

    if (opponent.rows.length > 0) {
      const opp = opponent.rows[0] as { user_id: string; queue_id: string };

      // Remove opponent from queue
      await client.query('DELETE FROM duel_queue WHERE id = $1', [opp.queue_id]);

      // Create duel with both players
      const { rows } = await client.query(`
        INSERT INTO duels (tenant_id, challenge_id, player_a_id, player_b_id, island_id, difficulty, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
      `, [tenantId, challenge.id, opp.user_id, userId, island.id, difficulty]);

      return { duel: rows[0], matched: true };
    } else {
      // Add self to queue
      await client.query(`
        INSERT INTO duel_queue (user_id, island_id, difficulty, user_level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE
        SET island_id = $2, difficulty = $3, user_level = $4, created_at = NOW()
      `, [userId, island.id, difficulty, user.current_level]);

      return { duel: null, matched: false };
    }
  });

  if (result.matched) {
    res.status(201).json({
      success: true,
      data: result.duel,
      message: 'Opponent found! Duel started.',
    });
  } else {
    res.status(202).json({
      success: true,
      data: null,
      message: 'Added to matchmaking queue. You will be notified when an opponent is found.',
    });
  }
}

export async function getPendingDuels(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const duels = await query(`
    SELECT d.*,
           pc.title_de, pc.title_en, pc.description_de, pc.description_en,
           ua.display_name AS player_a_name,
           ub.display_name AS player_b_name,
           i.slug AS island_slug, i.name_de AS island_name_de, i.name_en AS island_name_en
    FROM duels d
    JOIN prompt_challenges pc ON pc.id = d.challenge_id
    JOIN users ua ON ua.id = d.player_a_id
    LEFT JOIN users ub ON ub.id = d.player_b_id
    LEFT JOIN islands i ON i.id = d.island_id
    WHERE (d.player_a_id = $1 OR d.player_b_id = $1)
      AND d.status IN ('pending', 'waiting_for_b')
      AND d.expires_at > NOW()
    ORDER BY d.created_at DESC
  `, [userId]);

  // Filter: only show duels where this user hasn't submitted yet
  const pending = duels.filter(d => {
    const duel = d as unknown as {
      player_a_id: string;
      player_b_id: string;
      player_a_prompt: string | null;
      player_b_prompt: string | null;
    };
    if (duel.player_a_id === userId) return !duel.player_a_prompt;
    if (duel.player_b_id === userId) return !duel.player_b_prompt;
    return false;
  });

  res.json({ success: true, data: pending });
}

export async function submitDuelPrompt(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { prompt_text } = req.body as { prompt_text: string };
  const { tenantId, userId } = req.user!;

  const duel = await queryOne(`
    SELECT d.*, pc.description_de, pc.description_en, pc.ideal_prompt_de, pc.ideal_prompt_en, pc.xp_reward_max
    FROM duels d
    JOIN prompt_challenges pc ON pc.id = d.challenge_id
    WHERE d.id = $1 AND d.status IN ('pending', 'waiting_for_b') AND d.expires_at > NOW()
  `, [id]);

  if (!duel) throw new AppError(404, 'Duel not found or expired');

  const d = duel as unknown as {
    id: string;
    player_a_id: string;
    player_b_id: string;
    player_a_prompt: string | null;
    player_b_prompt: string | null;
    description_de: string;
    description_en: string;
    ideal_prompt_de: string;
    ideal_prompt_en: string;
    xp_reward_max: number;
    tenant_id: string;
  };

  if (d.player_a_id !== userId && d.player_b_id !== userId) {
    throw new AppError(403, 'Not a participant in this duel');
  }

  const isPlayerA = d.player_a_id === userId;
  const alreadySubmitted = isPlayerA ? !!d.player_a_prompt : !!d.player_b_prompt;
  if (alreadySubmitted) throw new AppError(409, 'Already submitted prompt for this duel');

  // Evaluate prompt
  const user = await queryOne<{ preferred_language: string }>(
    'SELECT preferred_language FROM users WHERE id = $1', [userId]
  );
  const lang = user?.preferred_language ?? 'de';
  const evaluation = await MistralService.evaluatePrompt(
    prompt_text,
    lang === 'de' ? d.description_de : d.description_en,
    lang === 'de' ? d.ideal_prompt_de : d.ideal_prompt_en
  );

  const updateField = isPlayerA
    ? 'player_a_prompt = $2, player_a_score = $3'
    : 'player_b_prompt = $2, player_b_score = $3';

  await query(
    `UPDATE duels SET ${updateField}, updated_at = NOW() WHERE id = $1`,
    [id, prompt_text, evaluation.total]
  );

  // Check if both have submitted → complete duel
  const updated = await queryOne(`
    SELECT player_a_prompt, player_b_prompt, player_a_score, player_b_score,
           player_a_id, player_b_id
    FROM duels WHERE id = $1
  `, [id]);

  const u = updated as unknown as {
    player_a_prompt: string | null;
    player_b_prompt: string | null;
    player_a_score: number | null;
    player_b_score: number | null;
    player_a_id: string;
    player_b_id: string;
  };

  if (u.player_a_prompt && u.player_b_prompt) {
    const aScore = u.player_a_score ?? 0;
    const bScore = u.player_b_score ?? 0;
    const winnerId = aScore > bScore ? u.player_a_id : bScore > aScore ? u.player_b_id : null;

    await query(`
      UPDATE duels
      SET status = 'completed', winner_id = $2, completed_at = NOW()
      WHERE id = $1
    `, [id, winnerId]);

    // Award XP: winner gets max, loser gets participation XP
    const winnerXp = d.xp_reward_max;
    const loserXp = Math.round(d.xp_reward_max * 0.2);

    if (winnerId) {
      const loserId = winnerId === u.player_a_id ? u.player_b_id : u.player_a_id;
      await XPService.awardXP(winnerId, winnerXp, d.tenant_id);
      await XPService.awardXP(loserId, loserXp, d.tenant_id);

      // Update leaderboard duel wins
      await query(`
        INSERT INTO leaderboard_entries (tenant_id, user_id, period_type, period_start, duels_won)
        VALUES ($1, $2, 'alltime', '2000-01-01', 1)
        ON CONFLICT (tenant_id, user_id, period_type, period_start)
        DO UPDATE SET duels_won = leaderboard_entries.duels_won + 1
      `, [tenantId, winnerId]);
    } else {
      // Draw: both get half
      await XPService.awardXP(u.player_a_id, Math.round(winnerXp * 0.6), d.tenant_id);
      await XPService.awardXP(u.player_b_id, Math.round(winnerXp * 0.6), d.tenant_id);
    }

    logger.info({ duelId: id, winnerId, aScore, bScore }, 'Duel completed');
  }

  res.json({
    success: true,
    data: {
      evaluation,
      message: u.player_a_prompt && u.player_b_prompt
        ? 'Duel complete! Check /result for outcome.'
        : 'Prompt submitted. Waiting for opponent.',
    },
  });
}

export async function getDuelResult(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { userId } = req.user!;

  const duel = await queryOne(`
    SELECT d.*,
           ua.display_name AS player_a_name, ua.current_level AS player_a_level,
           ub.display_name AS player_b_name, ub.current_level AS player_b_level,
           uw.display_name AS winner_name,
           pc.title_de, pc.title_en, pc.description_de, pc.description_en,
           pc.ideal_prompt_de, pc.ideal_prompt_en
    FROM duels d
    JOIN users ua ON ua.id = d.player_a_id
    LEFT JOIN users ub ON ub.id = d.player_b_id
    LEFT JOIN users uw ON uw.id = d.winner_id
    JOIN prompt_challenges pc ON pc.id = d.challenge_id
    WHERE d.id = $1 AND (d.player_a_id = $2 OR d.player_b_id = $2)
  `, [id, userId]);

  if (!duel) throw new AppError(404, 'Duel not found');

  const d = duel as unknown as { status: string };
  if (d.status !== 'completed') {
    throw new AppError(400, 'Duel not yet completed');
  }

  res.json({ success: true, data: duel });
}

export async function getDuelHistory(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;
  const page = parseInt(req.query.page as string ?? '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const duels = await query(`
    SELECT d.*,
           ua.display_name AS player_a_name,
           ub.display_name AS player_b_name,
           uw.display_name AS winner_name,
           pc.title_de, pc.title_en
    FROM duels d
    JOIN users ua ON ua.id = d.player_a_id
    LEFT JOIN users ub ON ub.id = d.player_b_id
    LEFT JOIN users uw ON uw.id = d.winner_id
    JOIN prompt_challenges pc ON pc.id = d.challenge_id
    WHERE (d.player_a_id = $1 OR d.player_b_id = $1)
      AND d.status = 'completed'
    ORDER BY d.completed_at DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);

  res.json({ success: true, data: duels });
}
