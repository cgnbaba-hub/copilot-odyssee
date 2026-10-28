import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createDuel, getPendingDuels, submitDuelPrompt,
  getDuelResult, getDuelHistory,
} from '../controllers/duelController';

const router = Router();
router.use(authenticate);

router.post('/create', [
  body('island_slug').trim().notEmpty(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
], validate, createDuel);

router.get('/pending', getPendingDuels);
router.get('/history', getDuelHistory);
router.post('/:id/submit', [
  body('prompt_text').trim().isLength({ min: 10, max: 2000 }),
], validate, submitDuelPrompt);
router.get('/:id/result', getDuelResult);

export default router;
