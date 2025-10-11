import { Router } from 'express';
import {
    getFlashcards,
    getFlashcard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard
} from '../controllers/flashcardController';
import { protect } from '@/middlewares/auth';

const router = Router();

// All routes below are protected
router.use(protect);

router.route('/')
    .get(getFlashcards);

router.route('/:id')
    .get(getFlashcard)
    .put(updateFlashcard)
    .delete(deleteFlashcard);

// Nested route for subject's flashcards
router.route('/subject/:subjectId')
    .get(getFlashcards)
    .post(createFlashcard);

export default router;