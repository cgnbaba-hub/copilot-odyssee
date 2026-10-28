import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import islandRoutes from './islands';
import quizRoutes from './quiz';
import promptRoutes from './prompt';
import duelRoutes from './duel';
import leaderboardRoutes from './leaderboard';
import guildRoutes from './guild';
import questRoutes from './quest';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/islands', islandRoutes);
router.use('/quiz', quizRoutes);
router.use('/prompt', promptRoutes);
router.use('/duel', duelRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/guild', guildRoutes);
router.use('/quest', questRoutes);
router.use('/admin', adminRoutes);

export default router;
