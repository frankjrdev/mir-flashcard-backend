import { Router } from 'express';
import { FlashcardController } from '@/controllers/flashcard.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  createFlashcardValidator,
  updateFlashcardValidator,
  flashcardIdValidator,
  subjectIdParamValidator,
  deckIdParamValidator,
  reviewFlashcardValidator,
  searchFlashcardsValidator,
  queryParamsValidator,
} from '@/validators/flashcard.validator';

const flashcardRouter = Router();
const flashcardController = new FlashcardController();

// Todas las rutas requieren autenticación
flashcardRouter.use(authMiddleware);

// Routes
flashcardRouter.post('/', createFlashcardValidator, validate, flashcardController.createFlashcard);
flashcardRouter.get(
  '/search',
  searchFlashcardsValidator,
  validate,
  flashcardController.searchFlashcards
);
flashcardRouter.get('/due', queryParamsValidator, validate, flashcardController.getDueFlashcards);
flashcardRouter.get(
  '/subject/:subjectId',
  subjectIdParamValidator,
  queryParamsValidator,
  validate,
  flashcardController.getFlashcardsBySubject
);
flashcardRouter.get(
  '/deck/:deckId',
  deckIdParamValidator,
  queryParamsValidator,
  validate,
  flashcardController.getFlashcardsByDeck
);
flashcardRouter.get('/:id', flashcardIdValidator, validate, flashcardController.getFlashcardById);
flashcardRouter.put(
  '/:id',
  updateFlashcardValidator,
  validate,
  flashcardController.updateFlashcard
);
flashcardRouter.delete('/:id', flashcardIdValidator, validate, flashcardController.deleteFlashcard);
flashcardRouter.post(
  '/:id/review',
  reviewFlashcardValidator,
  validate,
  flashcardController.reviewFlashcard
);

export default flashcardRouter;
