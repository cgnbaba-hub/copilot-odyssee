import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getGlobalLeaderboard, getIslandLeaderboard,
  getGuildLeaderboard, getDuelLeaderboard,
} from '../controllers/leaderboardController';

const router = Router();
router.use(authenticate);

router.get('/global', getGlobalLeaderboard);
router.get('/island/:slug', getIslandLeaderboard);
router.get('/guild', getGuildLeaderboard);
router.get('/duels', getDuelLeaderboard);

export default router;
