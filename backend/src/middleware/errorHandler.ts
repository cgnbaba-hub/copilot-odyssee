import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Postgres errors
  const pgErr = err as { code?: string };
  if (pgErr.code === '23505') {
    res.status(409).json({ success: false, error: 'Resource already exists' });
    return;
  }
  if (pgErr.code === '23503') {
    res.status(400).json({ success: false, error: 'Referenced resource not found' });
    return;
  }

  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  res.status(500).json({ success: false, error: 'Internal server error' });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
}
