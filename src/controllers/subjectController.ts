import { Request, Response, NextFunction } from 'express';
import Subject from '../models/Subject';
import Flashcard from '../models/Flashcard';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Gestión de materias de estudio
 */

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Obtener todas las materias
 *     description: Los administradores ven todas las materias, los usuarios solo las suyas
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de materias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subjects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subject'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la materia
 *                 example: 'Anatomía Humana'
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la materia
 *                 example: 'Estudio de la estructura del cuerpo humano'
 *     responses:
 *       201:
 *         description: Materia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
const getSubjects = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // If user is admin, get all subjects, else get only user's subjects
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user.id };

    const subjects = await Subject.find(filter).populate('createdBy', 'name email');

    sendResponse(res, 200, true, 'Subjects retrieved successfully', { subjects });
});

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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre de la materia
 *               description:
 *                 type: string
 *                 description: Nueva descripción de la materia
 *     responses:
 *       200:
 *         description: Materia actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Eliminar una materia
 *     description: Elimina la materia y todas sus flashcards asociadas
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
 *       200:
 *         description: Materia eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Materia eliminada exitosamente'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
const getSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const subject = await Subject.findById(req.params.id).populate('createdBy', 'name email');

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to access this subject'));
    }

    sendResponse(res, 200, true, 'Subject retrieved successfully', { subject });
});

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
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la materia
 *                 example: Anatomía
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la materia
 *                 example: Estudio de la estructura del cuerpo humano
 *     responses:
 *       201:
 *         description: Materia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
const createSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const subject = await Subject.create(req.body);

    sendResponse(res, 201, true, 'Subject created successfully', { subject });
});

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private
const updateSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to update this subject'));
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Subject updated successfully', { subject });
});

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private
const deleteSubject = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to delete this subject'));
    }

    // Delete all flashcards associated with this subject
    await Flashcard.deleteMany({ subject: req.params.id });

    await subject.deleteOne();

    sendResponse(res, 200, true, 'Subject deleted successfully', {});
});

export { getSubjects, getSubject, createSubject, updateSubject, deleteSubject };