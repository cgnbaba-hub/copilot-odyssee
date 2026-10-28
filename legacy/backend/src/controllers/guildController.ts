import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export async function createGuild(req: Request, res: Response): Promise<void> {
  const { name, description, emblem_config = {} } = req.body as {
    name: string;
    description?: string;
    emblem_config?: Record<string, unknown>;
  };
  const { tenantId, userId } = req.user!;

  // Check if user already in a guild
  const existing = await queryOne(
    'SELECT id FROM guild_members WHERE user_id = $1',
    [userId]
  );
  if (existing) throw new AppError(409, 'Already a member of a guild');

  const [guild] = await query(`
    INSERT INTO guilds (tenant_id, name, description, emblem_config, leader_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [tenantId, name, description ?? null, JSON.stringify(emblem_config), userId]);

  const g = guild as unknown as { id: string };

  // Add creator as leader
  await query(
    'INSERT INTO guild_members (guild_id, user_id, role) VALUES ($1, $2, $3)',
    [g.id, userId, 'leader']
  );

  res.status(201).json({ success: true, data: guild });
}

export async function getGuild(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tenantId } = req.user!;

  const guild = await queryOne(`
    SELECT g.*,
           COUNT(gm.user_id)::int AS member_count,
           u.display_name AS leader_name
    FROM guilds g
    LEFT JOIN guild_members gm ON gm.guild_id = g.id
    LEFT JOIN users u ON u.id = g.leader_id
    WHERE g.id = $1 AND g.tenant_id = $2
    GROUP BY g.id, u.display_name
  `, [id, tenantId]);

  if (!guild) throw new AppError(404, 'Guild not found');

  const members = await query(`
    SELECT u.id, u.display_name, u.current_level, u.avatar_config, gm.role, gm.joined_at,
           u.total_xp
    FROM guild_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.guild_id = $1
    ORDER BY gm.role, u.total_xp DESC
  `, [id]);

  res.json({ success: true, data: { ...guild, members } });
}

export async function joinGuild(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tenantId, userId } = req.user!;

  // Check if user already in a guild
  const existing = await queryOne(
    'SELECT id FROM guild_members WHERE user_id = $1',
    [userId]
  );
  if (existing) throw new AppError(409, 'Already a member of a guild');

  const guild = await queryOne<{ id: string; max_members: number }>(
    'SELECT id, max_members FROM guilds WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  if (!guild) throw new AppError(404, 'Guild not found');

  const memberCount = await queryOne<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM guild_members WHERE guild_id = $1',
    [id]
  );
  if ((memberCount?.count ?? 0) >= guild.max_members) {
    throw new AppError(400, 'Guild is full');
  }

  await query(
    'INSERT INTO guild_members (guild_id, user_id, role) VALUES ($1, $2, $3)',
    [id, userId, 'member']
  );

  res.json({ success: true, message: 'Joined guild successfully' });
}

export async function leaveGuild(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { userId } = req.user!;

  const member = await queryOne<{ role: string }>(
    'SELECT role FROM guild_members WHERE guild_id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!member) throw new AppError(404, 'Not a member of this guild');

  if (member.role === 'leader') {
    // Transfer leadership or dissolve
    const nextLeader = await queryOne<{ user_id: string }>(
      'SELECT user_id FROM guild_members WHERE guild_id = $1 AND user_id != $2 ORDER BY role, joined_at ASC LIMIT 1',
      [id, userId]
    );
    if (nextLeader) {
      await query('UPDATE guilds SET leader_id = $1 WHERE id = $2', [nextLeader.user_id, id]);
      await query("UPDATE guild_members SET role = 'leader' WHERE guild_id = $1 AND user_id = $2", [id, nextLeader.user_id]);
    } else {
      // Last member – delete guild
      await query('DELETE FROM guilds WHERE id = $1', [id]);
      res.json({ success: true, message: 'Guild dissolved (last member)' });
      return;
    }
  }

  await query('DELETE FROM guild_members WHERE guild_id = $1 AND user_id = $2', [id, userId]);
  res.json({ success: true, message: 'Left guild successfully' });
}

export async function getMyGuild(req: Request, res: Response): Promise<void> {
  const { userId } = req.user!;

  const member = await queryOne<{ guild_id: string }>(
    'SELECT guild_id FROM guild_members WHERE user_id = $1',
    [userId]
  );

  if (!member) {
    res.json({ success: true, data: null });
    return;
  }

  // Re-use getGuild logic
  req.params.id = member.guild_id;
  await getGuild(req, res);
}

export async function searchGuilds(req: Request, res: Response): Promise<void> {
  const { tenantId } = req.user!;
  const search = (req.query.q as string) ?? '';

  const guilds = await query(`
    SELECT g.id, g.name, g.description, g.emblem_config, g.level, g.total_xp,
           COUNT(gm.user_id)::int AS member_count, g.max_members
    FROM guilds g
    LEFT JOIN guild_members gm ON gm.guild_id = g.id
    WHERE g.tenant_id = $1
      AND ($2 = '' OR g.name ILIKE '%' || $2 || '%')
    GROUP BY g.id
    ORDER BY g.total_xp DESC
    LIMIT 20
  `, [tenantId, search]);

  res.json({ success: true, data: guilds });
}
