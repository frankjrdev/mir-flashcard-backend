import { Response } from 'express';
import { FlashcardService } from '../services/flashcard.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class FlashcardController {
  private flashcardService: FlashcardService;

  constructor() {
    this.flashcardService = new FlashcardService();
  }

  createFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.createFlashcard(req.user.id, req.body);
      res.status(201).json(flashcard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getFlashcardsBySubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { subjectId } = req.params;
      const { page, limit, difficulty, tags, deckId } = req.query;

      const options: any = {};
      if (page) options.page = Number.parseInt(page as string);
      if (limit) options.limit = Number.parseInt(limit as string);
      if (difficulty) options.difficulty = difficulty as string;
      if (tags) options.tags = (tags as string).split(',');
      if (deckId !== undefined) {
        options.deckId = deckId === 'null' ? null : deckId;
      }

      const result = await this.flashcardService.getFlashcardsBySubject(
        req.user.id,
        subjectId,
        options
      );
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  getFlashcardsByDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { deckId } = req.params;
      const { page, limit, difficulty, tags } = req.query;

      const options: any = {};
      if (page) options.page = Number.parseInt(page as string);
      if (limit) options.limit = Number.parseInt(limit as string);
      if (difficulty) options.difficulty = difficulty as string;
      if (tags) options.tags = (tags as string).split(',');

      const result = await this.flashcardService.getFlashcardsByDeck(req.user.id, deckId, options);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  getFlashcardById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.getFlashcardById(req.user.id, req.params.id);
      res.json(flashcard);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.updateFlashcard(
        req.user.id,
        req.params.id,
        req.body
      );
      res.json(flashcard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.flashcardService.deleteFlashcard(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  reviewFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.reviewFlashcard(
        req.user.id,
        req.params.id,
        req.body.performance
      );
      res.json(flashcard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  searchFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { q: query } = req.query;
      const { page, limit, subjectId, deckId } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }

      const options: any = {};
      if (page) options.page = Number.parseInt(page as string);
      if (limit) options.limit = Number.parseInt(limit as string);
      if (subjectId) options.subjectId = subjectId as string;
      if (deckId) options.deckId = deckId as string;

      const result = await this.flashcardService.searchFlashcards(
        req.user.id,
        query as string,
        options
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getDueFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, subjectId, deckId } = req.query;

      const options: any = {};
      if (page) options.page = Number.parseInt(page as string);
      if (limit) options.limit = Number.parseInt(limit as string);
      if (subjectId) options.subjectId = subjectId as string;
      if (deckId) options.deckId = deckId as string;

      const result = await this.flashcardService.getDueFlashcards(req.user.id, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
