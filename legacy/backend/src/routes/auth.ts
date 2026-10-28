import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '20', 10),
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('display_name').trim().isLength({ min: 1, max: 100 }),
  body('preferred_language').optional().isIn(['de', 'en']),
], validate, register);

router.post('/login', authLimiter, [
  body('login').trim().notEmpty(),
  body('password').notEmpty(),
], validate, login);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
