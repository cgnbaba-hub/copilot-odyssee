import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDailyQuest, getWeeklyQuest } from '../controllers/questController';

const router = Router();
router.use(authenticate);

router.get('/daily', getDailyQuest);
router.get('/weekly', getWeeklyQuest);

export default router;
