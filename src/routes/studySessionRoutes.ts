import { Router } from 'express';
import {
  getStudySessions,
  createStudySession,
  getStudyStatistics,
} from '../controllers/studySessionController';
import { protect } from '@/middlewares/auth.middelware';

const router = Router();

// All routes below are protected
router.use(protect);

router.route('/').get(getStudySessions).post(createStudySession);

router.get('/statistics', getStudyStatistics);

export default router;
