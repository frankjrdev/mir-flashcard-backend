import { Router } from 'express';
import { DeckController } from '@/controllers/deck.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  createDeckValidator,
  updateDeckValidator,
  deckIdValidator,
  subjectIdParamValidator,
  moveFlashcardsValidator,
} from '@/validators/deck.validator';

const deckRouter = Router();
const deckController = new DeckController();

// Todas las rutas requieren autenticación
deckRouter.use(authMiddleware);

// Routes
deckRouter.post('/', createDeckValidator, validate, deckController.createDeck);
deckRouter.get(
  '/subject/:subjectId',
  subjectIdParamValidator,
  validate,
  deckController.getDecksBySubject
);
deckRouter.get('/:id', deckIdValidator, validate, deckController.getDeckWithFlashcards);
deckRouter.put('/:id', updateDeckValidator, validate, deckController.updateDeck);
deckRouter.delete('/:id', deckIdValidator, validate, deckController.deleteDeck);
deckRouter.post(
  '/:id/move-flashcards',
  moveFlashcardsValidator,
  validate,
  deckController.moveFlashcardsToDeck
);

export default deckRouter;
