import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import type { User, JwtPayload } from '../types';

const JWT_EXPIRES_IN = '7d';
const SESSION_EXPIRES_DAYS = 7;
const SALT_ROUNDS = 12;

function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, display_name, preferred_language = 'de' } = req.body as {
    username: string;
    email: string;
    password: string;
    display_name: string;
    preferred_language?: string;
  };

  // Get default tenant
  const tenant = await queryOne<{ id: string }>(
    'SELECT id FROM tenants WHERE slug = $1',
    ['default']
  );
  if (!tenant) throw new AppError(500, 'Default tenant not found');

  // Check duplicate
  const existing = await queryOne(
    'SELECT id FROM users WHERE tenant_id = $1 AND (username = $2 OR email = $3)',
    [tenant.id, username.toLowerCase(), email.toLowerCase()]
  );
  if (existing) throw new AppError(409, 'Username or email already taken');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await query<User>(`
    INSERT INTO users (tenant_id, username, email, password_hash, display_name, preferred_language)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, tenant_id, username, email, display_name, current_level, total_xp, preferred_language, role, avatar_config
  `, [tenant.id, username.toLowerCase(), email.toLowerCase(), password_hash, display_name, preferred_language]);

  // Initialize island progress for first island
  const firstIsland = await queryOne<{ id: string }>(
    'SELECT id FROM islands WHERE tenant_id = $1 AND sort_order = 0 AND is_active = true ORDER BY sort_order ASC LIMIT 1',
    [tenant.id]
  );
  if (firstIsland) {
    await query(
      'INSERT INTO island_progress (user_id, island_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [user.id, firstIsland.id, 'available']
    );
  }

  // Create session
  const token = generateToken({ userId: user.id, tenantId: tenant.id, role: user.role });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRES_DAYS);

  await query(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
    [uuidv4(), user.id, token, expiresAt]
  );

  logger.info({ userId: user.id, username: user.username }, 'User registered');

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        current_level: user.current_level,
        total_xp: user.total_xp,
        preferred_language: user.preferred_language,
        role: user.role,
        avatar_config: user.avatar_config,
      },
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { login: loginInput, password } = req.body as { login: string; password: string };

  const tenant = await queryOne<{ id: string }>(
    'SELECT id FROM tenants WHERE slug = $1',
    ['default']
  );
  if (!tenant) throw new AppError(500, 'Default tenant not found');

  const user = await queryOne<User>(`
    SELECT id, tenant_id, username, email, password_hash, display_name, current_level,
           total_xp, preferred_language, role, avatar_config
    FROM users
    WHERE tenant_id = $1 AND (username = $2 OR email = $2)
  `, [tenant.id, loginInput.toLowerCase()]);

  if (!user) throw new AppError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const token = generateToken({ userId: user.id, tenantId: user.tenant_id, role: user.role });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRES_DAYS);

  await query(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
    [uuidv4(), user.id, token, expiresAt]
  );

  logger.info({ userId: user.id }, 'User logged in');

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        current_level: user.current_level,
        total_xp: user.total_xp,
        preferred_language: user.preferred_language,
        role: user.role,
        avatar_config: user.avatar_config,
      },
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    await query('DELETE FROM sessions WHERE token = $1', [token]);
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError(401, 'Not authenticated');

  const user = await queryOne<User>(`
    SELECT id, tenant_id, username, email, display_name, current_level, total_xp,
           preferred_language, role, avatar_config, created_at
    FROM users WHERE id = $1
  `, [req.user.userId]);

  if (!user) throw new AppError(404, 'User not found');

  // Get badges
  const badges = await query(`
    SELECT b.slug, b.name_de, b.name_en, b.icon_url, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON b.id = ub.badge_id
    WHERE ub.user_id = $1
    ORDER BY ub.earned_at DESC
  `, [req.user.userId]);

  res.json({ success: true, data: { ...user, badges } });
}
