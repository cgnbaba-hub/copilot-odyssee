import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGuild, getGuild, joinGuild, leaveGuild, getMyGuild, searchGuilds } from '../controllers/guildController';

const router = Router();
router.use(authenticate);

router.post('/create', [
  body('name').trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
], validate, createGuild);

router.get('/my', getMyGuild);
router.get('/search', searchGuilds);
router.get('/:id', getGuild);
router.post('/:id/join', joinGuild);
router.post('/:id/leave', leaveGuild);

export default router;
