import { Request, Response } from 'express';
import { DeckService } from '../services/deck.service';
import { AuthRequest } from '@/middleware/auth.middleware';

export class DeckController {
  private deckService: DeckService;

  constructor() {
    this.deckService = new DeckService();
  }

  createDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.createDeck(req.user.id, req.body);
      res.status(201).json(deck);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getDecksBySubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const decks = await this.deckService.getDecksBySubject(req.user.id, req.params.subjectId);
      res.json(decks);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  getDeckWithFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.getDeckWithFlashcards(req.user.id, req.params.id);
      res.json(deck);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.updateDeck(req.user.id, req.params.id, req.body);
      res.json(deck);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.deckService.deleteDeck(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  moveFlashcardsToDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.deckService.moveFlashcardsToDeck(
        req.user.id,
        req.params.id,
        req.body.flashcardIds
      );
      res.json({ message: 'Flashcards movidas al deck exitosamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
