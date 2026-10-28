import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateAvatar, getUserProgress, getUserStats } from '../controllers/userController';

const router = Router();
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/avatar', updateAvatar);
router.get('/progress', getUserProgress);
router.get('/stats', getUserStats);

export default router;
