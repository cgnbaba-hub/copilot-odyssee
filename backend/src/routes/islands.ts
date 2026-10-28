import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getIslands, getIsland, getIslandProgress } from '../controllers/islandController';

const router = Router();
router.use(authenticate);

router.get('/', getIslands);
router.get('/:slug', getIsland);
router.get('/:slug/progress', getIslandProgress);

export default router;
