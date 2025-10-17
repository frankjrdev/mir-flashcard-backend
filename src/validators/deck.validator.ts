import { body, param, query } from 'express-validator';

export const createDeckValidator = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre es requerido y debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('subjectId').isMongoId().withMessage('ID de subject inválido'),
];

export const updateDeckValidator = [
  param('id').isMongoId().withMessage('ID de deck inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
];

export const deckIdValidator = [param('id').isMongoId().withMessage('ID de deck inválido')];

export const subjectIdParamValidator = [
  param('subjectId').isMongoId().withMessage('ID de subject inválido'),
];

export const moveFlashcardsValidator = [
  param('id').isMongoId().withMessage('ID de deck inválido'),
  body('flashcardIds')
    .isArray({ min: 1 })
    .withMessage('flashcardIds debe ser un array con al menos un elemento'),
  body('flashcardIds.*').isMongoId().withMessage('Cada ID de flashcard debe ser válido'),
];
export const getDecksBySubjectValidator = [
  query('subjectId').isMongoId().withMessage('ID de subject inválido'),
];
