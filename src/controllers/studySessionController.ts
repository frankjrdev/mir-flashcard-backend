import { Request, Response, NextFunction } from 'express';
import StudySession from '../models/StudySession';
import Flashcard from '../models/Flashcard';
import Subject from '../models/Subject';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: StudySessions
 *   description: Gestión de sesiones de estudio
 */

/**
 * @swagger
 * /api/study-sessions:
 *   get:
 *     summary: Obtener todas las sesiones de estudio
 *     description: Los administradores ven todas las sesiones, los usuarios solo las suyas
 *     tags: [StudySessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones de estudio
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
 *                     studySessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudySession'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   post:
 *     summary: Crear una nueva sesión de estudio
 *     tags: [StudySessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - duration
 *               - cardsStudied
 *               - correctAnswers
 *               - incorrectAnswers
 *             properties:
 *               subject:
 *                 type: string
 *                 description: ID de la materia estudiada
 *               duration:
 *                 type: number
 *                 description: Duración de la sesión en minutos
 *                 example: 30
 *               cardsStudied:
 *                 type: number
 *                 description: Número total de tarjetas estudiadas
 *                 example: 20
 *               correctAnswers:
 *                 type: number
 *                 description: Número de respuestas correctas
 *                 example: 15
 *               incorrectAnswers:
 *                 type: number
 *                 description: Número de respuestas incorrectas
 *                 example: 5
 *     responses:
 *       201:
 *         description: Sesión de estudio creada exitosamente
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
 *                   $ref: '#/components/schemas/StudySession'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
const getStudySessions = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // If user is admin, get all study sessions, else get only user's study sessions
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

    const studySessions = await StudySession.find(filter)
        .populate('user', 'name email')
        .populate('subject', 'name');

    sendResponse(res, 200, true, 'Study sessions retrieved successfully', { studySessions });
});

/**
 * @swagger
 * /api/study-sessions/statistics:
 *   get:
 *     summary: Obtener estadísticas de estudio
 *     description: Obtiene estadísticas de las sesiones de estudio del usuario
 *     tags: [StudySessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filtrar por ID de materia
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estadísticas de estudio
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
 *                     totalSessions:
 *                       type: number
 *                       description: Número total de sesiones
 *                     totalTimeSpent:
 *                       type: number
 *                       description: Tiempo total de estudio en minutos
 *                     totalCardsStudied:
 *                       type: number
 *                       description: Total de tarjetas estudiadas
 *                     averageAccuracy:
 *                       type: number
 *                       description: Precisión promedio en porcentaje
 *                     sessionsByDate:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
const createStudySession = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // Add user to req.body
    req.body.user = req.user.id;

    const { subject, duration, cardsStudied, correctAnswers, incorrectAnswers } = req.body;

    // Check if subject exists and user has access to it
    const subjectDoc = await Subject.findById(subject);

    if (!subjectDoc) {
        return next(new Error(`Subject not found with id of ${subject}`));
    }

    // Make sure user owns the subject or is admin
    if (subjectDoc.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new Error('Not authorized to add study sessions to this subject'));
    }

    // Create study session
    const studySession = await StudySession.create({
        user: req.user.id,
        subject,
        duration,
        cardsStudied,
        correctAnswers,
        incorrectAnswers
    });

    // Update flashcard review dates based on performance
    if (correctAnswers > 0 || incorrectAnswers > 0) {
        const performance = correctAnswers / (correctAnswers + incorrectAnswers);
        let daysToAdd = 1; // Default: review in 1 day

        if (performance >= 0.8) {
            daysToAdd = 7; // If performance is 80% or higher, review in 7 days
        } else if (performance >= 0.5) {
            daysToAdd = 3; // If performance is 50-79%, review in 3 days
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

        // Update flashcards' next review date
        await Flashcard.updateMany(
            { subject, nextReviewDate: { $lte: new Date() } },
            {
                $set: {
                    nextReviewDate,
                    lastReviewed: new Date(),
                    $inc: { reviewCount: 1 }
                }
            }
        );
    }

    sendResponse(res, 201, true, 'Study session created successfully', { studySession });
});

// @desc    Get study statistics
// @route   GET /api/v1/study-sessions/statistics
// @access  Private
const getStudyStatistics = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // If user is admin, get all study sessions, else get only user's study sessions
    const match: any = { user: req.user.id };

    if (req.query.subject) {
        match.subject = req.query.subject;
    }

    const studySessions = await StudySession.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                totalCardsStudied: { $sum: '$cardsStudied' },
                totalCorrectAnswers: { $sum: '$correctAnswers' },
                totalIncorrectAnswers: { $sum: '$incorrectAnswers' },
                averageScore: { $avg: { $divide: ['$correctAnswers', { $add: ['$correctAnswers', '$incorrectAnswers'] }] } }
            }
        }
    ]);

    // Get subjects with study statistics
    const subjects = await StudySession.aggregate([
        { $match: { user: req.user._id } },
        {
            $lookup: {
                from: 'subjects',
                localField: 'subject',
                foreignField: '_id',
                as: 'subject'
            }
        },
        { $unwind: '$subject' },
        {
            $group: {
                _id: '$subject._id',
                name: { $first: '$subject.name' },
                sessions: { $sum: 1 },
                cardsStudied: { $sum: '$cardsStudied' },
                correctAnswers: { $sum: '$correctAnswers' },
                incorrectAnswers: { $sum: '$incorrectAnswers' }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                sessions: 1,
                cardsStudied: 1,
                correctAnswers: 1,
                incorrectAnswers: 1,
                successRate: {
                    $multiply: [
                        {
                            $cond: [
                                { $eq: [{ $add: ['$correctAnswers', '$incorrectAnswers'] }, 0] },
                                0,
                                {
                                    $divide: [
                                        '$correctAnswers',
                                        { $add: ['$correctAnswers', '$incorrectAnswers'] }
                                    ]
                                }
                            ]
                        },
                        100
                    ]
                }
            }
        }
    ]);

    const statistics = {
        ...(studySessions[0] || {
            totalSessions: 0,
            totalDuration: 0,
            totalCardsStudied: 0,
            totalCorrectAnswers: 0,
            totalIncorrectAnswers: 0,
            averageScore: 0
        }),
        subjects
    };

    sendResponse(res, 200, true, 'Study statistics retrieved successfully', { statistics });
});

export { getStudySessions, createStudySession, getStudyStatistics };