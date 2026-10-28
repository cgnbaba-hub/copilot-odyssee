import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getNextChallenge, submitPrompt, getPromptHistory } from '../controllers/promptController';

const router = Router();
router.use(authenticate);

// Mistral API rate limit: 10 per hour per user (also enforced in controller)
const mistralLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MISTRAL_MAX ?? '10', 10),
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'unknown',
  message: { success: false, error: 'Rate limit: max 10 AI evaluations per hour' },
});

router.get('/:islandSlug/next', getNextChallenge);
router.get('/:islandSlug/history', getPromptHistory);
router.post('/submit', mistralLimiter, [
  body('challenge_id').isUUID(),
  body('prompt_text').trim().isLength({ min: 10, max: 2000 }),
], validate, submitPrompt);

export default router;
