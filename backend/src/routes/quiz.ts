import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getNextQuestion, submitAnswer, getQuizStats } from '../controllers/quizController';

const router = Router();
router.use(authenticate);

router.get('/:islandSlug/next', getNextQuestion);
router.get('/:islandSlug/stats', getQuizStats);
router.post('/answer', [
  body('question_id').isUUID(),
  body('option_id').isUUID(),
], validate, submitAnswer);

export default router;
