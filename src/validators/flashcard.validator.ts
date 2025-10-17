import { body, param, query } from 'express-validator';

export const createFlashcardValidator = [
  body('question').notEmpty().trim().isLength({ min: 1 }).withMessage('La pregunta es requerida'),
  body('answer').notEmpty().trim().isLength({ min: 1 }).withMessage('La respuesta es requerida'),
  body('subjectId').isMongoId().withMessage('ID de subject inválido'),
  body('deckId').optional().isMongoId().withMessage('ID de deck inválido'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('La dificultad debe ser: easy, medium o hard'),
  body('tags').optional().isArray().withMessage('Tags debe ser un array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Cada tag debe ser un string válido'),
];

export const updateFlashcardValidator = [
  param('id').isMongoId().withMessage('ID de flashcard inválido'),
  body('question')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('La pregunta no puede estar vacía'),
  body('answer')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('La respuesta no puede estar vacía'),
  body('deckId')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string' && new RegExp(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('ID de deck inválido');
    }),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('La dificultad debe ser: easy, medium o hard'),
  body('tags').optional().isArray().withMessage('Tags debe ser un array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Cada tag debe ser un string válido'),
];

export const flashcardIdValidator = [
  param('id').isMongoId().withMessage('ID de flashcard inválido'),
];

export const subjectIdParamValidator = [
  param('subjectId').isMongoId().withMessage('ID de subject inválido'),
];

export const deckIdParamValidator = [
  param('deckId').isMongoId().withMessage('ID de deck inválido'),
];

export const reviewFlashcardValidator = [
  param('id').isMongoId().withMessage('ID de flashcard inválido'),
  body('performance')
    .isIn(['again', 'hard', 'good', 'easy'])
    .withMessage('Performance debe ser: again, hard, good o easy'),
];

export const searchFlashcardsValidator = [
  query('q').notEmpty().withMessage('Query parameter "q" es requerido'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit debe ser un número entre 1 y 100'),
  query('subjectId').optional().isMongoId().withMessage('ID de subject inválido'),
  query('deckId').optional().isMongoId().withMessage('ID de deck inválido'),
];

export const queryParamsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit debe ser un número entre 1 y 100'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad debe ser: easy, medium o hard'),
  query('tags').optional().isString().withMessage('Tags debe ser un string separado por comas'),
  query('deckId')
    .optional()
    .custom((value) => {
      if (value === 'null') return true;
      if (value?.match(/^[0-9a-fA-F]{24}$/)) return true;
      throw new Error('ID de deck inválido');
    }),
];
