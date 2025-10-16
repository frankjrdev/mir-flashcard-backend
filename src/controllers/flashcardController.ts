import { Request, Response, NextFunction } from 'express';
import Flashcard from '../models/Flashcard';
import Subject from '../models/Subject';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Gestión de flashcards del sistema
 */

/**
 * @swagger
 * /api/flashcards:
 *   get:
 *     summary: Obtener todas las flashcards
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *         description: ID de la materia para filtrar flashcards
 *     responses:
 *       200:
 *         description: Lista de flashcards
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 *     responses:
 *       200:
 *         description: Lista de flashcards de la materia
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *       404:
 *         description: Materia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getFlashcards = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    if (req.params.subjectId) {
        // Check if subject exists and user has access to it
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject) {
            return next(new Error(`Subject not found with id of ${req.params.subjectId}`));
        }

        // Make sure user owns the subject or is admin
        if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new Error('Not authorized to access this subject'));
        }

        const flashcards = await Flashcard.find({ subject: req.params.subjectId });

        return sendResponse(res, 200, true, 'Flashcards retrieved successfully', {
            flashcards
        });
    } else {
        // If no subjectId is provided, get all flashcards for the user
        const subjects = await Subject.find({ createdBy: req.user.id });
        const subjectIds = subjects.map(subject => subject._id);

        const flashcards = await Flashcard.find({ subject: { $in: subjectIds } })
            .populate('subject', 'name');

        sendResponse(res, 200, true, 'Flashcards retrieved successfully', {
            flashcards
        });
    }
});

// @desc    Get single flashcard
// @route   GET /api/v1/flashcards/:id
// @access  Private
const getFlashcard = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const flashcard = await Flashcard.findById(req.params.id).populate('subject', 'name');

    if (!flashcard) {
        return next(new Error(`Flashcard not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    const subject = await Subject.findById(flashcard.subject);

    if (subject?.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to access this flashcard'));
    }

    sendResponse(res, 200, true, 'Flashcard retrieved successfully', { flashcard });
});

/**
 * @swagger
 * /api/subjects/{subjectId}/flashcards:
 *   post:
 *     summary: Crear una nueva flashcard en una materia específica
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la materia a la que pertenecerá la flashcard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *                 description: Pregunta o concepto principal de la flashcard
 *                 example: ¿Cuál es la capital de Francia?
 *               answer:
 *                 type: string
 *                 description: Respuesta o definición detallada
 *                 example: París
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: Nivel de dificultad de la flashcard
 *                 default: medium
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas para categorizar la flashcard
 *                 example: ["anatomía", "sistema nervioso"]
 *               explanation:
 *                 type: string
 *                 description: Explicación detallada o contexto adicional
 *     responses:
 *       201:
 *         description: Flashcard creada exitosamente
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
 *                   $ref: '#/components/schemas/Flashcard'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Materia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const createFlashcard = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // Add subject to req.body
    req.body.subject = req.params.subjectId;
    req.body.createdBy = req.user.id;

    // Check if subject exists and user has access to it
    const subject = await Subject.findById(req.params.subjectId);

    if (!subject) {
        return next(new Error(`Subject not found with id of ${req.params.subjectId}`));
    }

    // Make sure user owns the subject or is admin
    if (subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to add flashcards to this subject'));
    }

    const flashcard = await Flashcard.create(req.body);

    sendResponse(res, 201, true, 'Flashcard created successfully', { flashcard });
});

// @desc    Update flashcard
// @route   PUT /api/v1/flashcards/:id
// @access  Private
const updateFlashcard = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
        return next(new Error(`Flashcard not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    const subject = await Subject.findById(flashcard.subject);

    if (subject?.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to update this flashcard'));
    }

    flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Flashcard updated successfully', { flashcard });
});

// @desc    Delete flashcard
// @route   DELETE /api/v1/flashcards/:id
// @access  Private
const deleteFlashcard = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
        return next(new Error(`Flashcard not found with id of ${req.params.id}`));
    }

    // Make sure user owns the subject or is admin
    const subject = await Subject.findById(flashcard.subject);

    if (subject?.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to delete this flashcard'));
    }

    await flashcard.deleteOne();

    sendResponse(res, 200, true, 'Flashcard deleted successfully', {});
});

export { getFlashcards, getFlashcard, createFlashcard, updateFlashcard, deleteFlashcard };