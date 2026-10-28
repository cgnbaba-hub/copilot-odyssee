import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';
import { queryOne } from '../config/database';
import { logger } from '../config/logger';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload = jwt.verify(token, secret) as JwtPayload;

    // Check session still valid in DB
    const session = await queryOne(
      'SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (!session) {
      res.status(401).json({ success: false, error: 'Session expired or invalid' });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    logger.warn({ err }, 'Auth failed');
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }
  const token = authHeader.substring(7);
  try {
    const secret = process.env.JWT_SECRET ?? '';
    req.user = jwt.verify(token, secret) as JwtPayload;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
