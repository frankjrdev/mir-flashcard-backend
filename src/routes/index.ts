import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import subjectRoutes from './subjectRoutes';
import flashcardRoutes from './flashcardRoutes';
import studySessionRoutes from './studySessionRoutes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/subjects', subjectRoutes);
router.use('/flashcards', flashcardRoutes);
router.use('/study-sessions', studySessionRoutes);

export default router;