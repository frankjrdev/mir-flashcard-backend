import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { AuthRequest } from '@/middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Gestión de materias o asignaturas
 */

export class SubjectController {
  private subjectService: SubjectService;

  constructor() {
    this.subjectService = new SubjectService();
  }

  /**
   * @swagger
   * /api/subjects:
   *   post:
   *     summary: Crear una nueva materia
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SubjectInput'
   *     responses:
   *       201:
   *         description: Materia creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Subject'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.createSubject(req.user.id, req.body);
      res.status(201).json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects:
   *   get:
   *     summary: Obtener todas las materias del usuario
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de materias del usuario
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  getUserSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subjects = await this.subjectService.getUserSubjects(req.user.id);
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{id}:
   *   get:
   *     summary: Obtener una materia por ID
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia
   *     responses:
   *       200:
   *         description: Detalles de la materia
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Materia no encontrada
   */
  getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.getSubjectById(req.user.id, req.params.id);
      res.json(subject);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{id}:
   *   put:
   *     summary: Actualizar una materia
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SubjectUpdateInput'
   *     responses:
   *       200:
   *         description: Materia actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Subject'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Materia no encontrada
   */
  updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const subject = await this.subjectService.updateSubject(req.user.id, req.params.id, req.body);
      res.json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{id}:
   *   delete:
   *     summary: Eliminar una materia
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia a eliminar
   *     responses:
   *       204:
   *         description: Materia eliminada exitosamente
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Materia no encontrada
   */
  deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.subjectService.deleteSubject(req.user.id, req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/subjects/{id}/stats:
   *   get:
   *     summary: Obtener estadísticas de una materia
   *     description: Devuelve estadísticas sobre las flashcards y el progreso de aprendizaje
   *     tags: [Subjects]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la materia
   *     responses:
   *       200:
   *         description: Estadísticas de la materia
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SubjectStats'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Materia no encontrada
   */
  getSubjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.subjectService.getSubjectStats(req.user.id, req.params.id);
      res.json(stats);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
