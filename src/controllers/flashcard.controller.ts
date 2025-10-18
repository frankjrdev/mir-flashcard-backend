import { Response } from 'express';
import { FlashcardService } from '../services/flashcard.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Operaciones relacionadas con las flashcards
 */

export class FlashcardController {
  private flashcardService: FlashcardService;

  constructor() {
    this.flashcardService = new FlashcardService();
  }

  /**
   * @swagger
   * /api/flashcards:
   *   post:
   *     summary: Crear una nueva flashcard
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FlashcardInput'
   *     responses:
   *       201:
   *         description: Flashcard creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Flashcard'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  createFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.createFlashcard(req.user.id, req.body);
      res.status(201).json(flashcard);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{subjectId}/flashcards:
   *   get:
   *     summary: Obtener flashcards por materia
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: subjectId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página para la paginación
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de resultados por página
   *       - in: query
   *         name: difficulty
   *         schema:
   *           type: string
   *           enum: [easy, medium, hard]
   *         description: Filtrar por dificultad
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Etiquetas para filtrar, separadas por comas
   *       - in: query
   *         name: deckId
   *         schema:
   *           type: string
   *         description: ID del mazo para filtrar (usar 'null' para flashcards sin mazo)
   *     responses:
   *       200:
   *         description: Lista de flashcards de la materia
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FlashcardList'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Materia no encontrada
   */
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

  /**
   * @swagger
   * /api/decks/{deckId}/flashcards:
   *   get:
   *     summary: Obtener flashcards por mazo
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: deckId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del mazo
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página para la paginación
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de resultados por página
   *       - in: query
   *         name: difficulty
   *         schema:
   *           type: string
   *           enum: [easy, medium, hard]
   *         description: Filtrar por dificultad
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Etiquetas para filtrar, separadas por comas
   *     responses:
   *       200:
   *         description: Lista de flashcards del mazo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FlashcardList'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Mazo no encontrado
   */
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

  /**
   * @swagger
   * /api/flashcards/{id}:
   *   get:
   *     summary: Obtener una flashcard por ID
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la flashcard
   *     responses:
   *       200:
   *         description: Detalles de la flashcard
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Flashcard'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Flashcard no encontrada
   */
  getFlashcardById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const flashcard = await this.flashcardService.getFlashcardById(req.user.id, req.params.id);
      res.json(flashcard);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/flashcards/{id}:
   *   put:
   *     summary: Actualizar una flashcard
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la flashcard a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FlashcardUpdateInput'
   *     responses:
   *       200:
   *         description: Flashcard actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Flashcard'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Flashcard no encontrada
   */
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

  /**
   * @swagger
   * /api/flashcards/{id}:
   *   delete:
   *     summary: Eliminar una flashcard
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la flashcard a eliminar
   *     responses:
   *       204:
   *         description: Flashcard eliminada exitosamente
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Flashcard no encontrada
   */
  deleteFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.flashcardService.deleteFlashcard(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/flashcards/{id}/review:
   *   post:
   *     summary: Registrar una revisión de flashcard
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la flashcard a revisar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - performance
   *             properties:
   *               performance:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 5
   *                 description: Calificación de rendimiento (0-5)
   *     responses:
   *       200:
   *         description: Revisión registrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Flashcard'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: Flashcard no encontrada
   */
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

  /**
   * @swagger
   * /api/flashcards/search:
   *   get:
   *     summary: Buscar flashcards
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Término de búsqueda
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página para la paginación
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de resultados por página
   *       - in: query
   *         name: subjectId
   *         schema:
   *           type: string
   *         description: Filtrar por ID de materia
   *       - in: query
   *         name: deckId
   *         schema:
   *           type: string
   *         description: Filtrar por ID de mazo
   *     responses:
   *       200:
   *         description: Resultados de la búsqueda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FlashcardList'
   *       400:
   *         description: Parámetro de búsqueda faltante
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
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

  /**
   * @swagger
   * /api/flashcards/due:
   *   get:
   *     summary: Obtener flashcards pendientes de revisión
   *     description: Devuelve las flashcards que están listas para ser repasadas según el algoritmo de repetición espaciada
   *     tags: [Flashcards]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página para la paginación
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de resultados por página
   *       - in: query
   *         name: subjectId
   *         schema:
   *           type: string
   *         description: Filtrar por ID de materia
   *       - in: query
   *         name: deckId
   *         schema:
   *           type: string
   *         description: Filtrar por ID de mazo
   *     responses:
   *       200:
   *         description: Lista de flashcards pendientes de revisión
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FlashcardList'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
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
