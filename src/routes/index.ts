import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import flashcardRouter from './flashcard.routes';
import subjectRouter from './subject.routes';
import deckRouter from './deck.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/flashcards', flashcardRouter);
router.use('/subjects', subjectRouter);
router.use('/decks', deckRouter); // Assuming deckRoutes is similar to subjectRoutes

export default router;
