import { Request, Response } from 'express';
import { DeckService } from '../services/deck.service';
import { AuthRequest } from '@/middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Decks
 *   description: Gestión de mazos de flashcards
 */

export class DeckController {
  private deckService: DeckService;

  constructor() {
    this.deckService = new DeckService();
  }

  /**
   * @swagger
   * /api/decks:
   *   post:
   *     summary: Crear un nuevo mazo
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DeckInput'
   *     responses:
   *       201:
   *         description: Mazo creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Deck'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  createDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.createDeck(req.user.id, req.body);
      res.status(201).json(deck);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{subjectId}/decks:
   *   get:
   *     summary: Obtener mazos por materia
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: subjectId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia
   *     responses:
   *       200:
   *         description: Lista de mazos de la materia
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Deck'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Materia no encontrada
   */
  getDecksBySubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const decks = await this.deckService.getDecksBySubject(req.user.id, req.params.subjectId);
      res.json(decks);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/decks/{id}:
   *   get:
   *     summary: Obtener un mazo con sus flashcards
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del mazo
   *     responses:
   *       200:
   *         description: Detalles del mazo con sus flashcards
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeckWithFlashcards'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Mazo no encontrado
   */
  getDeckWithFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.getDeckWithFlashcards(req.user.id, req.params.id);
      res.json(deck);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/decks/{id}:
   *   put:
   *     summary: Actualizar un mazo
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del mazo a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DeckUpdateInput'
   *     responses:
   *       200:
   *         description: Mazo actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Deck'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Mazo no encontrado
   */
  updateDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deck = await this.deckService.updateDeck(req.user.id, req.params.id, req.body);
      res.json(deck);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/decks/{id}:
   *   delete:
   *     summary: Eliminar un mazo
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del mazo a eliminar
   *     responses:
   *       204:
   *         description: Mazo eliminado exitosamente
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Mazo no encontrado
   */
  deleteDeck = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.deckService.deleteDeck(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/decks/{id}/move-flashcards:
   *   post:
   *     summary: Mover flashcards a este mazo
   *     tags: [Decks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del mazo destino
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - flashcardIds
   *             properties:
   *               flashcardIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: IDs de las flashcards a mover
   *     responses:
   *       200:
   *         description: Flashcards movidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Flashcards movidas al deck exitosamente"
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Mazo o flashcard no encontrada
   */
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
