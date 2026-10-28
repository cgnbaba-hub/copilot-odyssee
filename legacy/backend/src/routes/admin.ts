import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  listQuestions, createQuestion, updateQuestion, deleteQuestion,
  getActiveUsers, getLevelDistribution, getIslandCompletion,
  getPromptQualityTrend, getHardestQuestions, getDuelStatistics, exportCSV,
} from '../controllers/adminController';

const router = Router();
router.use(authenticate);
router.use(requireRole('content_admin', 'super_admin'));

// Quiz CRUD
router.get('/quiz', listQuestions);
router.post('/quiz', createQuestion);
router.put('/quiz/:id', updateQuestion);
router.delete('/quiz/:id', deleteQuestion);

// Analytics
router.get('/analytics/active-users', getActiveUsers);
router.get('/analytics/level-distribution', getLevelDistribution);
router.get('/analytics/island-completion', getIslandCompletion);
router.get('/analytics/prompt-quality-trend', getPromptQualityTrend);
router.get('/analytics/quiz-difficulty-analysis', getHardestQuestions);
router.get('/analytics/duel-statistics', getDuelStatistics);
router.get('/analytics/export/csv', exportCSV);

export default router;
