import { Router } from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { protect } from '@/middlewares/auth.middelware';

const router = Router();

// All routes below are protected
router.use(protect);

router.route('/').get(getSubjects).post(createSubject);

router.route('/:id').get(getSubject).put(updateSubject).delete(deleteSubject);

export default router;
